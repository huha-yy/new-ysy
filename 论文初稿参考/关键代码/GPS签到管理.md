# GPS签到管理模块 - 关键代码

## CheckInServiceImpl.java

```java
@Service
@Slf4j
@RequiredArgsConstructor
public class CheckInServiceImpl implements CheckInService {
    
    private final CheckInRecordMapper checkInRecordMapper;
    private final CheckpointMapper checkpointMapper;
    private final ActivityMapper activityMapper;
    
    private static final int CHECKIN_STATUS_NORMAL = 1;   // 正常
    private static final int CHECKIN_STATUS_LATE = 2;     // 迟到
    
    // GPS签到，包含距离计算、重复校验、状态判断
    @Override
    @Transactional(rollbackFor = Exception.class)
    public CheckInVO performCheckIn(Long userId, Long activityId, CheckInDTO checkInDTO) {
        // 获取签到点信息
        Checkpoint checkpoint = checkpointMapper.selectById(checkInDTO.getCheckpointId());
        if (checkpoint == null) {
            throw new BusinessException(ResultCode.CHECKPOINT_NOT_FOUND);
        }
        
        // 计算用户位置与签到点的距离（使用GeoUtils工具类）
        double distance = GeoUtils.calculateDistance(
            checkInDTO.getLatitude().doubleValue(),
            checkInDTO.getLongitude().doubleValue(),
            checkpoint.getLatitude().doubleValue(),
            checkpoint.getLongitude().doubleValue()
        );
        log.info("用户位置与签到点距离：{}米", distance);
        
        // 判断距离是否在有效半径内
        int effectiveRadius = checkpoint.getRadius() != null ? checkpoint.getRadius() : 100;
        if (distance > effectiveRadius) {
            throw new BusinessException(ResultCode.NOT_IN_CHECKIN_RANGE);
        }
        
        // 防止重复签到
        LambdaQueryWrapper<CheckInRecord> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(CheckInRecord::getUserId, userId)
                    .eq(CheckInRecord::getActivityId, activityId)
                    .eq(CheckInRecord::getCheckpointId, checkInDTO.getCheckpointId());
        if (checkInRecordMapper.selectOne(queryWrapper) != null) {
            throw new BusinessException(ResultCode.OPERATION_FAILED.getCode(), 
                                      "已在当前签到点签到，请勿重复签到");
        }
        
        // 判断签到状态（正常/迟到）
        Activity activity = activityMapper.selectById(activityId);
        Integer checkInStatus = determineCheckInStatus(activity, checkpoint);
        
        // 创建签到记录
        CheckInRecord checkInRecord = CheckInRecord.builder()
                .userId(userId)
                .activityId(activityId)
                .checkpointId(checkInDTO.getCheckpointId())
                .checkInTime(LocalDateTime.now())
                .latitude(checkInDTO.getLatitude())
                .longitude(checkInDTO.getLongitude())
                .distanceToCheckpoint((int) Math.round(distance))
                .status(checkInStatus)
                .build();
        
        checkInRecordMapper.insert(checkInRecord);
        log.info("签到成功，签到记录ID：{}", checkInRecord.getId());
        return convertToCheckInVO(checkInRecord, checkpoint);
    }
    
    // 判断签到状态（根据预计到达时间判断是否迟到）
    private Integer determineCheckInStatus(Activity activity, Checkpoint checkpoint) {
        if (checkpoint.getExpectedArriveMinutes() == null) {
            return CHECKIN_STATUS_NORMAL;
        }
        
        LocalDateTime activityStart = LocalDateTime.of(
            activity.getActivityDate(), activity.getStartTime());
        LocalDateTime expectedTime = activityStart.plusMinutes(
            checkpoint.getExpectedArriveMinutes());
        LocalDateTime toleranceTime = expectedTime.plusMinutes(10);
        
        return LocalDateTime.now().isAfter(toleranceTime) 
               ? CHECKIN_STATUS_LATE : CHECKIN_STATUS_NORMAL;
    }
}
```


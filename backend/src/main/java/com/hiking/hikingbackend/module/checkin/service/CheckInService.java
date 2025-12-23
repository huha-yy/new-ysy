package com.hiking.hikingbackend.module.checkin.service;

import com.hiking.hikingbackend.module.checkin.dto.CheckInDTO;
import com.hiking.hikingbackend.module.checkin.dto.TrackRecordDTO;
import com.hiking.hikingbackend.module.checkin.vo.CheckInVO;
import com.hiking.hikingbackend.module.checkin.vo.CheckInProgressVO;
import com.hiking.hikingbackend.module.route.entity.Checkpoint;

import java.util.List;

/**
 * 签到服务接口
 *
 * @author hiking-system
 * @since 2024-12-23
 */
public interface CheckInService {

    /**
     * GPS签到
     *
     * @param userId 用户ID
     * @param activityId 活动ID
     * @param checkInDTO 签到信息
     * @return 签到记录
     */
    CheckInVO performCheckIn(Long userId, Long activityId, CheckInDTO checkInDTO);

    /**
     * 批量上报轨迹
     *
     * @param userId 用户ID
     * @param trackRecords 轨迹记录列表
     */
    void batchUploadTracks(Long userId, List<TrackRecordDTO> trackRecords);

    /**
     * 获取签到状态/进度
     *
     * @param userId 用户ID
     * @param activityId 活动ID
     * @return 签到进度
     */
    CheckInProgressVO getCheckInStatus(Long userId, Long activityId);

    /**
     * 获取活动的签到点列表
     *
     * @param activityId 活动ID
     * @return 签到点列表
     */
    List<Checkpoint> getCheckpointsByActivity(Long activityId);

    /**
     * 获取活动所有参与者的签到状态（组织者）
     *
     * @param organizerId 组织者ID
     * @param activityId 活动ID
     * @return 参与者签到状态列表
     */
    List<CheckInProgressVO> getParticipantsCheckInStatus(Long organizerId, Long activityId);
}

package com.hiking.hikingbackend.module.review.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hiking.hikingbackend.common.exception.BusinessException;
import com.hiking.hikingbackend.common.result.ResultCode;
import com.hiking.hikingbackend.module.activity.entity.Activity;
import com.hiking.hikingbackend.module.activity.mapper.ActivityMapper;
import com.hiking.hikingbackend.module.registration.entity.Registration;
import com.hiking.hikingbackend.module.registration.mapper.RegistrationMapper;
import com.hiking.hikingbackend.module.review.dto.ReviewCreateDTO;
import com.hiking.hikingbackend.module.review.entity.Review;
import com.hiking.hikingbackend.module.review.mapper.ReviewMapper;
import com.hiking.hikingbackend.module.review.service.ReviewService;
import com.hiking.hikingbackend.module.review.vo.ReviewStatsVO;
import com.hiking.hikingbackend.module.review.vo.ReviewVO;
import com.hiking.hikingbackend.module.user.entity.User;
import com.hiking.hikingbackend.module.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 评价服务实现类
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewMapper reviewMapper;

    private final ActivityMapper activityMapper;

    private final UserMapper userMapper;

    private final RegistrationMapper registrationMapper;

    private static final int REGISTRATION_STATUS_APPROVED = 1;  // 报名已通过
    private static final int ACTIVITY_STATUS_ENDED = 4;       // 活动已结束
    private static final int REVIEW_STATUS_VISIBLE = 1;        // 评价显示

    /**
     * 提交评价（仅已完成活动的参与者）
     *
     * @param userId 用户ID
     * @param activityId 活动ID
     * @param createDTO 评价信息
     * @return 评价ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long submitReview(Long userId, Long activityId, ReviewCreateDTO createDTO) {
        // 1. 校验用户是否存在
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        // 2. 校验活动是否存在且已结束
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }
        if (activity.getStatus() != ACTIVITY_STATUS_ENDED) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_ENDED);
        }

        // 3. 校验用户是否已完成该活动（报名状态为已通过）
        LambdaQueryWrapper<Registration> registrationWrapper = new LambdaQueryWrapper<>();
        registrationWrapper.eq(Registration::getUserId, userId)
                .eq(Registration::getActivityId, activityId)
                .eq(Registration::getStatus, REGISTRATION_STATUS_APPROVED);
        Registration registration = registrationMapper.selectOne(registrationWrapper);
        if (registration == null) {
            throw new BusinessException(ResultCode.NOT_REGISTERED_FOR_ACTIVITY);
        }

        // 4. 校验用户是否已经评价过该活动（每人每活动仅可评价一次）
        LambdaQueryWrapper<Review> reviewWrapper = new LambdaQueryWrapper<>();
        reviewWrapper.eq(Review::getUserId, userId)
                .eq(Review::getActivityId, activityId);
        Review existingReview = reviewMapper.selectOne(reviewWrapper);
        if (existingReview != null) {
            throw new BusinessException(ResultCode.ALREADY_REVIEWED);
        }

        // 5. 构建评价对象并保存
        Review review = Review.builder()
                .userId(userId)
                .activityId(activityId)
                .overallRating(createDTO.getOverallRating())
                .routeRating(createDTO.getRouteRating())
                .organizationRating(createDTO.getOrganizationRating())
                .safetyRating(createDTO.getSafetyRating())
                .content(createDTO.getContent())
                .images(createDTO.getImages())
                .isAnonymous(createDTO.getIsAnonymous() != null ? createDTO.getIsAnonymous() : 0)
                .status(REVIEW_STATUS_VISIBLE)
                .build();

        reviewMapper.insert(review);
        log.info("评价提交成功，用户ID：{}，活动ID：{}，评价ID：{}", userId, activityId, review.getId());

        return review.getId();
    }

    /**
     * 获取活动评价列表
     *
     * @param activityId 活动ID
     * @param pageNum 页码
     * @param pageSize 每页大小
     * @return 分页结果
     */
    @Override
    public IPage<ReviewVO> getActivityReviews(Long activityId, Integer pageNum, Integer pageSize) {
        // 1. 校验活动是否存在
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }

        // 2. 构建查询条件（只查询显示状态的评价）
        LambdaQueryWrapper<Review> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Review::getActivityId, activityId)
                .eq(Review::getStatus, REVIEW_STATUS_VISIBLE)
                .orderByDesc(Review::getCreateTime);

        // 3. 分页查询
        Page<Review> page = new Page<>(pageNum, pageSize);
        IPage<Review> reviewPage = reviewMapper.selectPage(page, queryWrapper);

        // 4. 转换为VO
        return reviewPage.convert(this::convertToVO);
    }

    /**
     * 转换为VO
     */
    private ReviewVO convertToVO(Review review) {
        // 查询用户信息
        User user = userMapper.selectById(review.getUserId());
        String userNickname = user != null ? user.getNickname() : null;
        String userAvatar = user != null ? user.getAvatar() : null;

        // 如果是匿名评价，隐藏用户信息
        if (review.getIsAnonymous() != null && review.getIsAnonymous() == 1) {
            userNickname = "匿名用户";
            userAvatar = null;
        }

        // 查询活动信息
        Activity activity = activityMapper.selectById(review.getActivityId());
        String activityTitle = activity != null ? activity.getTitle() : null;

        // 处理图片URL数组
        String[] imagesArray = null;
        if (review.getImages() != null && !review.getImages().isEmpty()) {
            imagesArray = review.getImages().split(",");
        }

        // 计算平均评分
        double averageRating = 0.0;
        if (review.getOverallRating() != null && review.getRouteRating() != null &&
            review.getOrganizationRating() != null && review.getSafetyRating() != null) {
            averageRating = (review.getOverallRating() + review.getRouteRating() +
                            review.getOrganizationRating() + review.getSafetyRating()) / 4.0;
        }

        return ReviewVO.builder()
                .id(review.getId())
                .userId(review.getUserId())
                .userNickname(userNickname)
                .userAvatar(userAvatar)
                .activityId(review.getActivityId())
                .activityTitle(activityTitle)
                .overallRating(review.getOverallRating())
                .routeRating(review.getRouteRating())
                .organizationRating(review.getOrganizationRating())
                .safetyRating(review.getSafetyRating())
                .averageRating(averageRating)
                .content(review.getContent())
                .images(imagesArray)
                .isAnonymous(review.getIsAnonymous())
                .status(review.getStatus())
                .createTime(review.getCreateTime())
                .updateTime(review.getUpdateTime())
                .build();
    }

    /**
     * 获取活动评分统计
     *
     * @param activityId 活动ID
     * @return 评分统计
     */
    @Override
    public ReviewStatsVO getRatingStats(Long activityId) {
        // 1. 查询所有评价
        LambdaQueryWrapper<Review> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Review::getActivityId, activityId)
                .eq(Review::getStatus, REVIEW_STATUS_VISIBLE);
        java.util.List<Review> reviews = reviewMapper.selectList(queryWrapper);

        if (reviews == null || reviews.isEmpty()) {
            // 无评价时返回默认值
            return ReviewStatsVO.builder()
                    .overallRating(java.math.BigDecimal.ZERO)
                    .routeRating(java.math.BigDecimal.ZERO)
                    .organizationRating(java.math.BigDecimal.ZERO)
                    .safetyRating(java.math.BigDecimal.ZERO)
                    .totalReviews(0L)
                    .ratingDistribution(java.util.Collections.emptyList())
                    .build();
        }

        // 2. 计算各项评分平均值
        java.math.BigDecimal overallAvg = calculateAverage(reviews, Review::getOverallRating);
        java.math.BigDecimal routeAvg = calculateAverage(reviews, Review::getRouteRating);
        java.math.BigDecimal organizationAvg = calculateAverage(reviews, Review::getOrganizationRating);
        java.math.BigDecimal safetyAvg = calculateAverage(reviews, Review::getSafetyRating);

        // 3. 统计评分分布（1-5星各有多少个）
        java.util.List<ReviewStatsVO.RatingDistribution> distribution = new java.util.ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            final int rating = i;
            long count = reviews.stream()
                    .filter(r -> r.getOverallRating() != null && r.getOverallRating().intValue() == rating)
                    .count();
            distribution.add(ReviewStatsVO.RatingDistribution.builder()
                    .rating(rating)
                    .count(count)
                    .build());
        }

        // 4. 构建返回对象
        return ReviewStatsVO.builder()
                .overallRating(overallAvg)
                .routeRating(routeAvg)
                .organizationRating(organizationAvg)
                .safetyRating(safetyAvg)
                .totalReviews((long) reviews.size())
                .ratingDistribution(distribution)
                .build();
    }

    /**
     * 计算平均值
     *
     * @param reviews 评价列表
     * @param getter 评分getter方法
     * @return 平均值（保留1位小数）
     */
    private java.math.BigDecimal calculateAverage(java.util.List<Review> reviews, 
                                                         java.util.function.Function<Review, Integer> getter) {
        double sum = 0;
        int count = 0;

        for (Review review : reviews) {
            Integer rating = getter.apply(review);
            if (rating != null) {
                sum += rating;
                count++;
            }
        }

        if (count == 0) {
            return java.math.BigDecimal.ZERO;
        }

        return java.math.BigDecimal.valueOf(sum / count).setScale(1, java.math.RoundingMode.HALF_UP);
    }
}


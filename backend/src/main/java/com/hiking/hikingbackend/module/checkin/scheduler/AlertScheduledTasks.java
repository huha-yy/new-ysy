package com.hiking.hikingbackend.module.checkin.scheduler;

import com.hiking.hikingbackend.module.checkin.service.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 预警定时任务
 * <p>
 * 负责执行周期性的预警检测任务：
 * <ul>
 *   <li>超时未签到预警</li>
 *   <li>失联预警</li>
 * </ul>
 *
 * @author hiking-system
 * @since 2025-01-14
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AlertScheduledTasks {

    private final AlertService alertService;

    /**
     * 超时未签到预警检测任务
     * <p>
     * 每5分钟执行一次，检测所有进行中的活动，
     * 对于已超过预计签到时间但仍未签到用户，创建超时未签到预警
     * <p>
     * cron表达式: 0 */
    @Scheduled(cron = "0 */5 * * * ?")
    public void checkTimeoutAlerts() {
        log.debug("开始执行超时未签到预警检测任务");
        try {
            alertService.checkTimeoutAlerts();
            log.debug("超时未签到预警检测任务执行完成");
        } catch (Exception e) {
            log.error("超时未签到预警检测任务执行失败", e);
        }
    }

    /**
     * 失联预警检测任务
     * <p>
     * 每5分钟执行一次，检测所有进行中的活动参与者，
     * 对于超过阈值时间无轨迹上报的用户，创建失联预警
     * <p>
     * cron表达式: 0 */
    @Scheduled(cron = "0 */5 * * * ?")
    public void checkLostContactAlerts() {
        log.debug("开始执行失联预警检测任务");
        try {
            alertService.checkLostContactAlerts();
            log.debug("失联预警检测任务执行完成");
        } catch (Exception e) {
            log.error("失联预警检测任务执行失败", e);
        }
    }

    /**
     * 预警检测汇总任务
     * <p>
     * 每小时执行一次，记录预警检测统计信息
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void alertDetectionSummary() {
        log.info("=== 预警检测任务正常运行中 ===");
    }
}

package com.hiking.hikingbackend.module.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hiking.hikingbackend.common.exception.BusinessException;
import com.hiking.hikingbackend.common.result.ResultCode;
import com.hiking.hikingbackend.common.utils.JwtUtils;
import com.hiking.hikingbackend.module.user.dto.UserLoginDTO;
import com.hiking.hikingbackend.module.user.dto.UserProfileDTO;
import com.hiking.hikingbackend.module.user.dto.UserRegisterDTO;
import com.hiking.hikingbackend.module.user.entity.User;
import com.hiking.hikingbackend.module.user.entity.UserProfile;
import com.hiking.hikingbackend.module.user.mapper.UserMapper;
import com.hiking.hikingbackend.module.user.mapper.UserProfileMapper;
import com.hiking.hikingbackend.module.user.service.UserService;
import com.hiking.hikingbackend.module.user.vo.LoginVO;
import com.hiking.hikingbackend.module.user.vo.UserProfileVO;
import com.hiking.hikingbackend.module.user.vo.UserVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 用户服务实现类
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;

    private final UserProfileMapper userProfileMapper;

    private final JwtUtils jwtUtils;

    private final PasswordEncoder passwordEncoder;

    private static final int DEFAULT_ROLE = 0; // 普通用户

    /**
     * 用户注册
     *
     * @param userRegisterDTO 注册信息
     * @return 登录响应（包含token）
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public LoginVO register(UserRegisterDTO userRegisterDTO) {
        // 1. 校验用户名唯一性
        LambdaQueryWrapper<User> usernameQuery = new LambdaQueryWrapper<>();
        usernameQuery.eq(User::getUsername, userRegisterDTO.getUsername());
        User existingUser = userMapper.selectOne(usernameQuery);
        if (existingUser != null) {
            throw new BusinessException(ResultCode.USERNAME_ALREADY_EXISTS);
        }

        // 2. 校验手机号唯一性（如果提供了）
        if (userRegisterDTO.getPhone() != null && !userRegisterDTO.getPhone().isEmpty()) {
            LambdaQueryWrapper<User> phoneQuery = new LambdaQueryWrapper<>();
            phoneQuery.eq(User::getPhone, userRegisterDTO.getPhone());
            User existingPhone = userMapper.selectOne(phoneQuery);
            if (existingPhone != null) {
                throw new BusinessException(ResultCode.PHONE_ALREADY_EXISTS);
            }
        }

        // 3. 校验邮箱唯一性（如果提供了）
        if (userRegisterDTO.getEmail() != null && !userRegisterDTO.getEmail().isEmpty()) {
            LambdaQueryWrapper<User> emailQuery = new LambdaQueryWrapper<>();
            emailQuery.eq(User::getEmail, userRegisterDTO.getEmail());
            User existingEmail = userMapper.selectOne(emailQuery);
            if (existingEmail != null) {
                throw new BusinessException(ResultCode.EMAIL_ALREADY_EXISTS);
            }
        }

        // 4. 密码加密
        String encryptedPassword = passwordEncoder.encode(userRegisterDTO.getPassword());

        // 5. 创建用户
        User user = User.builder()
                .username(userRegisterDTO.getUsername())
                .password(encryptedPassword)
                .phone(userRegisterDTO.getPhone())
                .email(userRegisterDTO.getEmail())
                .role(DEFAULT_ROLE)
                .status(1) // 正常状态
                .build();

        userMapper.insert(user);
        log.info("用户注册成功，用户名：{}", user.getUsername());

        // 6. 创建空的用户档案
        UserProfile userProfile = UserProfile.builder()
                .userId(user.getId())
                .experienceLevel(0) // 默认为新手
                .build();

        userProfileMapper.insert(userProfile);

        // 7. 生成Token并返回
        String token = jwtUtils.generateToken(user.getId(), user.getUsername(), user.getRole());

        return LoginVO.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .status(user.getStatus())
                .lastLoginTime(user.getLastLoginTime())
                .build();
    }

    /**
     * 用户登录
     *
     * @param userLoginDTO 登录信息
     * @return 登录响应（包含token）
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public LoginVO login(UserLoginDTO userLoginDTO) {
        // 1. 根据用户名查询用户
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getUsername, userLoginDTO.getUsername());
        User user = userMapper.selectOne(queryWrapper);

        // 2. 校验用户是否存在
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        // 3. 校验用户状态
        if (user.getStatus() == 0) {
            throw new BusinessException(ResultCode.USER_DISABLED);
        }

        // 4. 验证密码
        if (!passwordEncoder.matches(userLoginDTO.getPassword(), user.getPassword())) {
            throw new BusinessException(ResultCode.PASSWORD_ERROR);
        }

        // 5. 生成Token
        String token = jwtUtils.generateToken(user.getId(), user.getUsername(), user.getRole());

        // 6. 更新最后登录时间
        user.setLastLoginTime(java.time.LocalDateTime.now());
        userMapper.updateById(user);

        log.info("用户登录成功，用户名：{}", user.getUsername());

        // 7. 返回登录响应
        return LoginVO.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .status(user.getStatus())
                .lastLoginTime(user.getLastLoginTime())
                .build();
    }

    /**
     * 获取当前用户信息
     *
     * @param userId 用户ID
     * @return 用户信息VO
     */
    @Override
    public UserVO getCurrentUser(Long userId) {
        // 1. 查询用户基本信息
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        // 2. 组装VO
        return UserVO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .phone(user.getPhone())
                .email(user.getEmail())
                .status(user.getStatus())
                .lastLoginTime(user.getLastLoginTime())
                .build();
    }

    /**
     * 获取用户档案
     *
     * @param userId 用户ID
     * @return 用户档案VO
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserProfileVO getUserProfile(Long userId) {
        // 1. 查询用户基本信息
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        // 2. 查询用户档案信息
        LambdaQueryWrapper<UserProfile> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UserProfile::getUserId, userId);
        UserProfile userProfile = userProfileMapper.selectOne(queryWrapper);

        // 3. 组装VO
        return UserProfileVO.builder()
                .userId(user.getId())
                .realName(userProfile != null ? userProfile.getRealName() : null)
                .gender(userProfile != null ? userProfile.getGender() : null)
                .birthDate(userProfile != null ? userProfile.getBirthDate() : null)
                .experienceLevel(userProfile != null ? userProfile.getExperienceLevel() : null)
                .healthStatus(userProfile != null ? userProfile.getHealthStatus() : null)
                .medicalHistory(userProfile != null ? userProfile.getMedicalHistory() : null)
                .emergencyContact(userProfile != null ? userProfile.getEmergencyContact() : null)
                .emergencyPhone(userProfile != null ? userProfile.getEmergencyPhone() : null)
                .phone(user != null ? user.getPhone() : null)
                .email(user != null ? user.getEmail() : null)
                .equipmentList(userProfile != null ? userProfile.getEquipmentList() : null)
                .preferenceIntensity(userProfile != null ? userProfile.getPreferenceIntensity() : null)
                .preferenceDistance(userProfile != null ? userProfile.getPreferenceDistance() : null)
                .preferenceRegion(userProfile != null ? userProfile.getPreferenceRegion() : null)
                .bio(userProfile != null ? userProfile.getBio() : null)
                .createTime(userProfile != null ? userProfile.getCreateTime() : null)
                .updateTime(userProfile != null ? userProfile.getUpdateTime() : null)
                .build();
    }

    /**
     * 更新用户档案
     *
     * @param userId      用户ID
     * @param profileDTO 档案信息
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateUserProfile(Long userId, UserProfileDTO profileDTO) {
        // 1. 查询用户是否存在
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        // 2. 查询档案是否存在
        LambdaQueryWrapper<UserProfile> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UserProfile::getUserId, userId);
        UserProfile userProfile = userProfileMapper.selectOne(queryWrapper);

        // 3. 更新或创建档案
        if (userProfile == null) {
            // 不存在则创建
            UserProfile newProfile = UserProfile.builder()
                    .userId(userId)
                    .realName(profileDTO.getRealName())
                    .gender(profileDTO.getGender())
                    .birthDate(profileDTO.getBirthDate())
                    .experienceLevel(profileDTO.getExperienceLevel())
                    .healthStatus(profileDTO.getHealthStatus())
                    .medicalHistory(profileDTO.getMedicalHistory())
                    .emergencyContact(profileDTO.getEmergencyContact())
                    .emergencyPhone(profileDTO.getEmergencyPhone())
                    .equipmentList(profileDTO.getEquipmentList())
                    .preferenceIntensity(profileDTO.getPreferenceIntensity())
                    .preferenceDistance(profileDTO.getPreferenceDistance())
                    .preferenceRegion(profileDTO.getPreferenceRegion())
                    .bio(profileDTO.getBio())
                    .build();

            userProfileMapper.insert(newProfile);
            log.info("创建用户档案成功，用户ID：{}", userId);
        } else {
            // 存在则更新
            UserProfile updateProfile = UserProfile.builder()
                    .userId(userId)
                    .realName(profileDTO.getRealName())
                    .gender(profileDTO.getGender())
                    .birthDate(profileDTO.getBirthDate())
                    .experienceLevel(profileDTO.getExperienceLevel())
                    .healthStatus(profileDTO.getHealthStatus())
                    .medicalHistory(profileDTO.getMedicalHistory())
                    .emergencyContact(profileDTO.getEmergencyContact())
                    .emergencyPhone(profileDTO.getEmergencyPhone())
                    .equipmentList(profileDTO.getEquipmentList())
                    .preferenceIntensity(profileDTO.getPreferenceIntensity())
                    .preferenceDistance(profileDTO.getPreferenceDistance())
                    .preferenceRegion(profileDTO.getPreferenceRegion())
                    .bio(profileDTO.getBio())
                    .build();

            userProfileMapper.updateById(updateProfile);
            log.info("更新用户档案成功，用户ID：{}", userId);
        }
    }
}


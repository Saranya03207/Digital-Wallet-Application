package com.wallet.digitalwallet.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import org.springframework.web.multipart.MultipartFile;

import com.wallet.digitalwallet.dto.ChangePasswordRequest;
import com.wallet.digitalwallet.dto.ForgotPasswordRequest;
import com.wallet.digitalwallet.dto.LoginRequest;
import com.wallet.digitalwallet.dto.LoginResponse;
import com.wallet.digitalwallet.dto.ResetPasswordRequest;
import com.wallet.digitalwallet.dto.SetPinRequest;
import com.wallet.digitalwallet.dto.UserRequestDTO;
import com.wallet.digitalwallet.dto.UserResponseDTO;
import com.wallet.digitalwallet.dto.UserUpdateRequest;
import com.wallet.digitalwallet.dto.VerifyOtpRequest;
import com.wallet.digitalwallet.entity.Role;
import com.wallet.digitalwallet.entity.Status;
import com.wallet.digitalwallet.entity.User;
import com.wallet.digitalwallet.entity.Wallet;
import com.wallet.digitalwallet.entity.WalletStatus;
import com.wallet.digitalwallet.repository.UserRepository;
import com.wallet.digitalwallet.repository.WalletRepository;
import com.wallet.digitalwallet.service.EmailService;

@Service
public class UserService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private WalletRepository walletRepository;
	
	@Autowired
	private EmailService emailService;

	@Autowired
	private BCryptPasswordEncoder passwordEncoder;
	
	

	public UserResponseDTO registerUser(UserRequestDTO request) {

		// If email exists but not verified → delete old record and re-register
		userRepository.findByEmail(request.getEmail()).ifPresent(existingUser -> {
			if (Boolean.FALSE.equals(existingUser.getEmailVerified())) {
				walletRepository.findByUser_Id(existingUser.getId())
						.ifPresent(walletRepository::delete);
				userRepository.delete(existingUser);
			} else {
				throw new RuntimeException("EMAIL_EXISTS");
			}
		});

		// If mobile exists but not verified → delete old record
		userRepository.findByMobileNumber(request.getMobileNumber()).ifPresent(existingUser -> {
			if (Boolean.FALSE.equals(existingUser.getEmailVerified())) {
				walletRepository.findByUser_Id(existingUser.getId())
						.ifPresent(walletRepository::delete);
				userRepository.delete(existingUser);
			} else {
				throw new RuntimeException("MOBILE_EXISTS");
			}
		});

		if (userRepository.existsByMobileNumber(request.getMobileNumber())) {

			throw new RuntimeException("MOBILE_EXISTS");
		}

		if (userRepository.existsByAadhaarNumber(request.getAadhaarNumber())) {

			throw new RuntimeException("AADHAAR_EXISTS");
		}

		if (!request.getMobileNumber().matches("[6-9]\\d{9}")) {

			throw new RuntimeException("INVALID_MOBILE");
		}

		if (!request.getEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {

			throw new RuntimeException("INVALID_EMAIL");
		}
		if (!request.getAadhaarNumber().matches("\\d{12}")) {

			throw new RuntimeException("INVALID_AADHAAR");
		}
		User user = new User();

		user.setFullName(request.getFullName());
		user.setEmail(request.getEmail());
		user.setMobileNumber(request.getMobileNumber());

		String randomPart = String.valueOf((int) (Math.random() * 9000) + 1000);

		String upiId = request.getFullName().toLowerCase().replaceAll("\\s+", "") + randomPart + "@walletpay";

		user.setUpiId(upiId);
		user.setRewardPoints(0);
		user.setAadhaarNumber(request.getAadhaarNumber());

		user.setDailyTransferLimit(new BigDecimal("50000"));

		user.setEmailVerified(false);
		user.setMobileVerified(false);
		user.setTransactionPin(null);

		user.setRole(Role.USER);
		user.setStatus(Status.ACTIVE);
		user.setCreatedAt(LocalDateTime.now());

		String password = request.getPassword();

		String regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!]).{8,}$";

		if (!password.matches(regex)) {

			throw new RuntimeException("WEAK_PASSWORD");
		}

		user.setPassword(passwordEncoder.encode(request.getPassword()));
		
		String otp = generateOtp();

		user.setEmailOtp(otp);

		user.setOtpExpiry(
		        LocalDateTime.now()
		                .plusMinutes(30));

		user.setEmailVerified(false);
		try {

		    emailService.sendOtp(
		            user.getEmail(),
		            otp);

		    System.out.println(
		            "OTP SENT : " + otp);

		} catch (Exception e) {

		    System.err.println("=== EMAIL ERROR ===");
		    System.err.println("Message : " + e.getMessage());
		    System.err.println("Cause   : " + (e.getCause() != null ? e.getCause().getMessage() : "none"));
		    e.printStackTrace();

		    throw new RuntimeException(
		            "EMAIL_SEND_FAILED: " + e.getMessage());
		}
		User savedUser = userRepository.save(user);

		Wallet wallet = new Wallet();

		wallet.setUser(savedUser);
		wallet.setBalance(BigDecimal.ZERO);
		wallet.setWalletStatus(WalletStatus.ACTIVE);
		wallet.setCreatedAt(LocalDateTime.now());

		walletRepository.save(wallet);

		UserResponseDTO response = new UserResponseDTO();

		response.setId(savedUser.getId());
		response.setFullName(savedUser.getFullName());
		response.setEmail(savedUser.getEmail());
		response.setMobileNumber(savedUser.getMobileNumber());

		response.setUpiId(savedUser.getUpiId());

		response.setRole(savedUser.getRole());

		response.setStatus(savedUser.getStatus());

		response.setCreatedAt(savedUser.getCreatedAt());

		return response;
	}

	public String activateUser(Long id) {

		User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

		user.setStatus(Status.ACTIVE);

		userRepository.save(user);

		return "User Activated Successfully";
	}

	// LOGIN METHOD
	public LoginResponse login(LoginRequest request) {

		User user = userRepository.findByEmail(request.getEmail())
				.orElseThrow(() -> new RuntimeException("INVALID_CREDENTIALS"));

		boolean matched = passwordEncoder.matches(request.getPassword(), user.getPassword());

		if (!matched) {
			throw new RuntimeException("INVALID_CREDENTIALS");
		}

		if (Boolean.FALSE.equals(user.getEmailVerified())) {
			throw new RuntimeException("EMAIL_NOT_VERIFIED");
		}

		if (user.getStatus() == Status.BLOCKED) {
			throw new RuntimeException("Account Blocked");
		}

		LoginResponse response = new LoginResponse();

		response.setUserId(user.getId());

		response.setFullName(user.getFullName());

		response.setRole(user.getRole().name());

		response.setMessage("Login Successful");

		response.setUpiId(user.getUpiId());

		return response;
	}

	public String deleteUser(Long id) {

		User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

		// Delete wallet first to avoid FK constraint failure
		walletRepository.findByUser_Id(id).ifPresent(walletRepository::delete);

		userRepository.delete(user);

		return "User Deleted Successfully";
	}

	public User getUserById(Long id) {

		return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
	}

	public List<User> getAllUsers() {

		return userRepository.findAll();
	}

	public String blockUser(Long id) {

		User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

		user.setStatus(Status.BLOCKED);

		userRepository.save(user);

		return "User Blocked Successfully";
	}

	public User updateUser(Long userId, UserUpdateRequest request) {

		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User Not Found"));

		user.setFullName(request.getFullName());

		user.setEmail(request.getEmail());

		user.setMobileNumber(request.getMobileNumber());

		String upiId = request.getFullName().toLowerCase().replaceAll("\\s+", "")
				+ request.getMobileNumber().substring(6) + "@walletpay";

		user.setUpiId(upiId);

		return userRepository.save(user);
	}

	public User uploadProfileImage(Long userId, MultipartFile file) throws IOException {

		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User Not Found"));

		String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "profile"
				+ File.separator;

		File directory = new File(uploadDir);

		if (!directory.exists()) {
			directory.mkdirs();
		}

		String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

		File destination = new File(uploadDir + fileName);

		System.out.println("Saving File To : " + destination.getAbsolutePath());

		if (user.getProfileImage() != null) {

			File oldFile = new File(uploadDir + user.getProfileImage());

			if (oldFile.exists()) {
				oldFile.delete();
			}
		}

		file.transferTo(destination);

		user.setProfileImage(fileName);

		return userRepository.save(user);
	}

	public List<User> searchUsers(String keyword, Long loggedInUserId) {

		return userRepository.findByUpiId(keyword).stream().filter(user -> !user.getId().equals(loggedInUserId))
				.toList();
	}

	public User searchByUpiId(String upiId) {

		return userRepository.findByUpiId(upiId).orElseThrow(() -> new RuntimeException("UPI ID Not Found"));
	}

	public List<User> searchUsersByName(String keyword, Long loggedInUserId) {

		return userRepository.findByFullNameContainingIgnoreCase(keyword).stream()
				.filter(user -> !user.getId().equals(loggedInUserId)).toList();
	}

	public String setTransactionPin(Long userId, SetPinRequest request) {

		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User Not Found"));

		boolean matched = passwordEncoder.matches(request.getPassword(), user.getPassword());

		if (!matched) {

			return "Invalid Password";
		}

		user.setTransactionPin(request.getTransactionPin());

		userRepository.save(user);
		
		String body =
		        "Dear "
		        + user.getFullName()
		        + ",\n\nYour WalletPay "
		        + "Transaction PIN "
		        + "was changed successfully.\n\n"
		        + "Date : "
		        + LocalDateTime.now()
		        + "\n\n"
		        + "If you did not perform "
		        + "this action contact support.";

		emailService.sendSecurityMail(
		        user.getEmail(),
		        "WalletPay Security Alert",
		        body);

		return "Transaction PIN Updated Successfully";
	}
	
	public String verifyOtp(
	        VerifyOtpRequest request) {

	    User user =
	            userRepository
	            .findByEmail(
	                    request.getEmail())
	            .orElseThrow(() ->
	                    new RuntimeException(
	                            "User Not Found"));

	    if(LocalDateTime.now()
	            .isAfter(
	                    user.getOtpExpiry())) {

	        return "OTP_EXPIRED";
	    }

	    if(!user.getEmailOtp()
	            .equals(
	                    request.getOtp())) {

	        return "INVALID_OTP";
	    }

	    user.setEmailVerified(true);

	    userRepository.save(user);

	    return "VERIFIED";
	}
	
	public String resendOtp(String email) {

	    User user =
	            userRepository
	            .findByEmail(email)
	            .orElseThrow(() ->
	                    new RuntimeException(
	                            "User Not Found"));

	    String otp = generateOtp();

	    user.setEmailOtp(otp);

	    user.setOtpExpiry(
	            LocalDateTime.now()
	                    .plusMinutes(30));

	    userRepository.save(user);

	    emailService.sendOtp(
	            email,
	            otp);

	    return "OTP_SENT";
	}
	
	private String generateOtp() {

		return String.valueOf(100000 + new Random().nextInt(900000));
	}
	
	public String forgotPassword(
	        ForgotPasswordRequest request)
	{
	    User user =
	            userRepository
	            .findByEmail(request.getEmail())
	            .orElseThrow(() ->
	                    new RuntimeException(
	                            "User Not Found"));

	    String otp = generateOtp();

	    user.setEmailOtp(otp);

	    user.setOtpExpiry(
	            LocalDateTime.now()
	                    .plusMinutes(5));

	    userRepository.save(user);

	    emailService.sendForgotPasswordOtp(
	            user.getEmail(),
	            user.getFullName(),
	            otp);

	    return "OTP_SENT";
	}
	
	public String resetPassword(
	        ResetPasswordRequest request)
	{
	    User user =
	            userRepository
	            .findByEmail(request.getEmail())
	            .orElseThrow(() ->
	                    new RuntimeException(
	                            "User Not Found"));

	    if(LocalDateTime.now()
	            .isAfter(
	                    user.getOtpExpiry()))
	    {
	        return "OTP_EXPIRED";
	    }

	    if(!user.getEmailOtp()
	            .equals(request.getOtp()))
	    {
	        return "INVALID_OTP";
	    }

	    user.setPassword(
	            passwordEncoder.encode(
	                    request.getNewPassword()));

	    userRepository.save(user);

	    emailService.sendPasswordChangedMail(
	            user.getEmail(),
	            user.getFullName());

	    return "PASSWORD_RESET_SUCCESS";
	}
	
	public String changePassword(
	        ChangePasswordRequest request)
	{

	    User user =
	            userRepository.findById(
	                    request.getUserId())
	                    .orElseThrow(() ->
	                            new RuntimeException(
	                                    "User Not Found"));

	    boolean matched =
	            passwordEncoder.matches(
	                    request.getCurrentPassword(),
	                    user.getPassword());

	    if(!matched)
	    {
	        return "INVALID_PASSWORD";
	    }

	    user.setPassword(
	            passwordEncoder.encode(
	                    request.getNewPassword()));

	    userRepository.save(user);

	    emailService.sendPasswordChangedMail(
	            user.getEmail(),
	            user.getFullName());

	    return "PASSWORD_CHANGED";
	}
	
	
}

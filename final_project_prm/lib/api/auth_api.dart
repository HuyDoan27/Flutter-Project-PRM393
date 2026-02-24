import 'package:dio/dio.dart';
import 'api_client.dart';

class AuthApi {
  static final Dio _dio = ApiClient().dio;

  /// Đăng ký
  static Future<Map<String, dynamic>> register({
    required String fullName,
    required String email,
    required String phoneNumber,
    required String password,
    String role = "user",
  }) async {
    try {
      final response = await _dio.post(
        "/auth/register",
        data: {
          "fullName": fullName,
          "email": email,
          "phoneNumber": phoneNumber,
          "password": password,
          "role": role,
        },
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  /// Đăng nhập
  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        "/auth/login",
        data: {"email": email, "password": password},
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  /// Đăng xuất
  static Future<void> logout() async {
    try {
      await _dio.post("/auth/logout");
    } catch (e) {
      rethrow;
    }
  }
}

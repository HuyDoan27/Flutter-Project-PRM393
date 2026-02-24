import 'package:dio/dio.dart';
import 'api_client.dart';

class UserApi {
  static final Dio _dio = ApiClient().dio;

  /// Lấy thông tin user hiện tại (token tự động đính kèm qua interceptor)
  static Future<Map<String, dynamic>> getUser() async {
    try {
      final response = await _dio.get("/users/me");
      return response.data;
    } catch (e) {
      rethrow;
    }
  }
}

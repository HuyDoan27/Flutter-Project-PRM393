import 'package:dio/dio.dart';
import 'api_client.dart';

class DoctorApi {
  static final Dio _dio = ApiClient().dio;

  /// Lấy tất cả bác sĩ
  static Future<List<dynamic>> getDoctors({String? name}) async {
    try {
      final response = await _dio.get(
        "/doctors",
        queryParameters: name != null && name.isNotEmpty
            ? {"name": name}
            : null,
      );
      return response.data["data"];
    } catch (e) {
      rethrow;
    }
  }

  static Future<List<dynamic>> getRandomDoctors() async {
    try {
      final response = await _dio.get("/doctors/random");

      return response.data["data"];
    } catch (e) {
      rethrow;
    }
  }
}

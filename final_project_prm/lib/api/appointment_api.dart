import 'package:dio/dio.dart';
import 'api_client.dart';

class AppointmentApi {
  static final Dio _dio = ApiClient().dio;

  /// Lấy danh sách lịch hẹn của user
  /// [status]: lọc theo trạng thái (optional)
  /// [page]: trang hiện tại (mặc định 1)
  /// [limit]: số lượng mỗi trang (mặc định 10)
  static Future<List<dynamic>> getUserAppointments(
    String userId, {
    String? status,
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await _dio.get(
        "/appointments/user/$userId",
        queryParameters: {
          "page": page,
          "limit": limit,
          if (status != null && status.isNotEmpty) "status": status,
        },
      );
      return response.data["data"];
    } catch (e) {
      rethrow;
    }
  }

  /// Lấy chi tiết một lịch hẹn
  static Future<Map<String, dynamic>> getAppointmentById(
    String appointmentId,
    String userId,
  ) async {
    try {
      final response = await _dio.get(
        "/appointments/$appointmentId",
        queryParameters: {"userId": userId},
      );
      return response.data["data"];
    } catch (e) {
      rethrow;
    }
  }

  /// Tạo lịch hẹn
  static Future<Map<String, dynamic>> createAppointment({
    required String doctorId,
    required String clinicId,
    required String clinicName,
    required DateTime appointmentDate,
    required String reason,
    String? notes,
    required double amount,
  }) async {
    try {
      final response = await _dio.post(
        "/appointments",
        data: {
          "doctorId": doctorId,
          "clinicId": clinicId,
          "clinicName": clinicName,
          "appointmentDate": appointmentDate.toIso8601String(),
          "reason": reason,
          "notes": notes,
          "amount": amount,
        },
      );

      if (response.data["success"] == true) {
        return {
          "success": true,
          "message": response.data["message"] ?? "Tạo lịch hẹn thành công",
        }; 
      } else {
        throw Exception(response.data["message"] ?? "Tạo lịch thất bại");
      }
    } catch (e) {
      rethrow;
    }
  }
}

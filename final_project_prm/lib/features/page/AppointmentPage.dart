import 'package:flutter/material.dart';
import '../../api/appointment_api.dart';

class AppointmentPage extends StatefulWidget {
  final Map<String, dynamic> doctor;
  final DateTime selectedDate;
  final String selectedTime;

  const AppointmentPage({
    super.key,
    required this.doctor,
    required this.selectedDate,
    required this.selectedTime,
  });

  @override
  State<AppointmentPage> createState() => _AppointmentPageState();
}

class _AppointmentPageState extends State<AppointmentPage> {
  static const Color primaryColor = Colors.teal;
  static const Color lightBg = Color(0xFFF8FFFD);

  late TextEditingController _reasonController;
  bool _isLoading = false;
  String? _errorMessage;

  // ✅ Giá khám (có thể lấy từ doctor data)
  static const int consultationFee = 1400000; // 1.4M đ
  static const int adminFee = 50000; // 50k đ
  static const int discount = 200000; // 200k đ
  static const int totalAmount =
      consultationFee + adminFee - discount; // 1.25M đ

  // ✅ Extract doctorId và clinicId từ doctor data
  late final String _doctorId;
  late final String _clinicId;

  @override
  void initState() {
    super.initState();
    _reasonController = TextEditingController(text: 'Khám tổng quát');

    // ✅ Lấy từ API response
    _doctorId = widget.doctor['_id'] ?? '';
    _clinicId = widget.doctor['clinicId'] ?? '';
  }

  @override
  void dispose() {
    _reasonController.dispose();
    super.dispose();
  }

  Widget _defaultAvatar(double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: const Color(0xFFE6F7F5),
        borderRadius: BorderRadius.circular(size * 0.25),
      ),
      child: Icon(
        Icons.person,
        size: size * 0.55,
        color: const Color(0xFF00B4A5),
      ),
    );
  }

  // ============================================
  // FORMAT DATE
  // ============================================
  String _formatDateForDisplay(DateTime date) {
    final List<String> dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    final List<String> monthNames = [
      'Tháng 1',
      'Tháng 2',
      'Tháng 3',
      'Tháng 4',
      'Tháng 5',
      'Tháng 6',
      'Tháng 7',
      'Tháng 8',
      'Tháng 9',
      'Tháng 10',
      'Tháng 11',
      'Tháng 12',
    ];

    return '${dayNames[date.weekday % 7]}, ${date.day} ${monthNames[date.month - 1]} ${date.year}';
  }

  // ============================================
  // COMBINE DATE & TIME
  // ============================================
  DateTime _combineDateTime(DateTime date, String time) {
    // Parse time string "09:00 AM" → hour, minute
    final timeParts = time.split(' ');
    final hourMin = timeParts[0].split(':');
    int hour = int.parse(hourMin[0]);
    final minute = int.parse(hourMin[1]);
    final isPM = timeParts[1] == 'PM';

    // Convert 12-hour to 24-hour format
    if (isPM && hour != 12) {
      hour += 12;
    } else if (!isPM && hour == 12) {
      hour = 0;
    }

    return DateTime(date.year, date.month, date.day, hour, minute);
  }

  // ============================================
  // CALL API - Create appointment
  // ============================================
  Future<void> _createAppointment() async {
    // ✅ Validate reason
    if (_reasonController.text.isEmpty) {
      setState(() {
        _errorMessage = 'Vui lòng nhập lý do khám';
      });
      return;
    }

    // ✅ Validate doctorId và clinicId
    if (_doctorId.isEmpty || _clinicId.isEmpty) {
      setState(() {
        _errorMessage = 'Thông tin bác sĩ không hợp lệ (thiếu ID)';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final appointmentDate = _combineDateTime(
        widget.selectedDate,
        widget.selectedTime,
      );

      print('🔍 DEBUG - Doctor ID: $_doctorId');
      print('🔍 DEBUG - Clinic ID: $_clinicId');
      print('🔍 DEBUG - Appointment DateTime: $appointmentDate');
      print('🔍 DEBUG - Reason: ${_reasonController.text}');

      // ✅ Gọi API tạo lịch hẹn
      final result = await AppointmentApi.createAppointment(
        doctorId: _doctorId,
        clinicId: _clinicId,
        clinicName: widget.doctor['clinicName'] ?? 'Phòng khám',
        appointmentDate: appointmentDate,
        reason: _reasonController.text.trim(),
        notes: null,
        amount: totalAmount.toDouble(), // ✅ Truyền amount
      );

      if (mounted) {
        // ✅ Hiển thị success message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Row(
              children: [
                Icon(Icons.check_circle, color: Colors.white),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Đặt lịch khám thành công! Vui lòng chờ xác nhận.',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
            backgroundColor: primaryColor,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            duration: const Duration(seconds: 3),
          ),
        );

        // ✅ Quay lại màn hình trước sau 2 giây
        Future.delayed(const Duration(seconds: 2), () {
          if (mounted) {
            Navigator.pop(context);
          }
        });
      }
    } catch (e) {
      final errorMsg = e.toString();
      setState(() {
        _errorMessage = errorMsg.contains('Exception:')
            ? errorMsg.replaceAll('Exception: ', '')
            : 'Có lỗi xảy ra: $errorMsg';
      });

      print('❌ Error: $_errorMessage');

      // ✅ Hiển thị error message
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.error_outline, color: Colors.white),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _errorMessage ?? 'Có lỗi xảy ra, vui lòng thử lại',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            backgroundColor: Colors.red.shade600,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final String fullName = widget.doctor["fullName"] ?? "No Name";
    final String avatar = widget.doctor["avatar"] ?? "";
    final String clinicName = widget.doctor["clinicName"] ?? "—";
    final String clinicAddress = widget.doctor["clinicAddress"] ?? "—";
    final String experience = widget.doctor["experience"] ?? "—";

    final displayDate = _formatDateForDisplay(widget.selectedDate);

    return Scaffold(
      backgroundColor: lightBg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: Colors.black87,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Xác nhận đặt lịch',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 12),

            // ===== DOCTOR CARD =====
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.12),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: avatar.isNotEmpty
                        ? Image.network(
                            avatar,
                            width: 80,
                            height: 80,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => _defaultAvatar(80),
                          )
                        : _defaultAvatar(80),
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          fullName,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Icon(
                              Icons.local_hospital_outlined,
                              size: 14,
                              color: Colors.teal.shade400,
                            ),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                clinicName,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.grey.shade700,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(
                              Icons.location_on_outlined,
                              size: 14,
                              color: Colors.grey.shade500,
                            ),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                clinicAddress,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey.shade500,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE6F7F5),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            experience,
                            style: const TextStyle(
                              fontSize: 11,
                              color: Color(0xFF00B4A5),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // ===== APPOINTMENT INFO =====
            const Text(
              'Thông tin lịch hẹn',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 16),

            _infoCard(
              icon: Icons.calendar_today,
              title: 'Ngày khám',
              value: displayDate,
            ),
            const SizedBox(height: 12),
            _infoCard(
              icon: Icons.access_time,
              title: 'Giờ khám',
              value: widget.selectedTime,
            ),
            const SizedBox(height: 12),

            // ===== REASON INPUT FIELD =====
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.08),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: primaryColor.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Icon(
                          Icons.note_alt_outlined,
                          color: primaryColor,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 16),
                      const Text(
                        'Lý do khám',
                        style: TextStyle(
                          color: Colors.grey,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _reasonController,
                    maxLines: 3,
                    maxLength: 200,
                    decoration: InputDecoration(
                      hintText: 'Nhập lý do khám...',
                      hintStyle: TextStyle(color: Colors.grey.shade400),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.grey.shade300),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(
                          color: primaryColor,
                          width: 2,
                        ),
                      ),
                      contentPadding: const EdgeInsets.all(12),
                      counterStyle: TextStyle(
                        color: Colors.grey.shade500,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // ===== PAYMENT DETAILS =====
            const Text(
              'Chi tiết thanh toán',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 16),

            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.12),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                children: [
                  _paymentRow('Phí khám bệnh', '${consultationFee ~/ 1000}k đ'),
                  _paymentRow('Phí hành chính', '${adminFee ~/ 1000}k đ'),
                  _paymentRow('Giảm giá ưu đãi', '-${discount ~/ 1000}k đ'),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Divider(height: 1),
                  ),
                  _paymentRow(
                    'Tổng cộng',
                    '${totalAmount ~/ 1000}k đ',
                    isTotal: true,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      const Icon(
                        Icons.credit_card,
                        color: primaryColor,
                        size: 20,
                      ),
                      const SizedBox(width: 10),
                      Text(
                        'Thanh toán bằng VISA **** 4242',
                        style: TextStyle(
                          color: Colors.grey.shade700,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // ===== ERROR MESSAGE =====
            if (_errorMessage != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.error_outline,
                      color: Colors.red.shade600,
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        _errorMessage!,
                        style: TextStyle(
                          color: Colors.red.shade700,
                          fontSize: 13,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 40),

            // ===== CONFIRM BUTTON =====
            Row(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Tổng thanh toán',
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${totalAmount ~/ 1000}k đ',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: primaryColor,
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 24),
                Expanded(
                  child: SizedBox(
                    height: 60,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _createAppointment,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primaryColor,
                        disabledBackgroundColor: Colors.grey.shade400,
                        elevation: 10,
                        shadowColor: primaryColor.withOpacity(0.4),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              height: 24,
                              width: 24,
                              child: CircularProgressIndicator(
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  Colors.white,
                                ),
                                strokeWidth: 2.5,
                              ),
                            )
                          : const Text(
                              'Xác nhận đặt lịch',
                              style: TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _infoCard({
    required IconData icon,
    required String title,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.08),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: primaryColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: primaryColor, size: 24),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _paymentRow(String title, String value, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: isTotal ? 16 : 15,
              color: isTotal ? Colors.black87 : Colors.grey.shade700,
              fontWeight: isTotal ? FontWeight.w600 : FontWeight.w400,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: isTotal ? 18 : 16,
              fontWeight: isTotal ? FontWeight.w800 : FontWeight.w600,
              color: isTotal ? primaryColor : Colors.black87,
            ),
          ),
        ],
      ),
    );
  }
}

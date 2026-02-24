import 'package:flutter/material.dart';

class AppointmentPage extends StatelessWidget {
  final Map<String, dynamic> doctor;
  final String selectedDate;
  final String selectedTime;

  const AppointmentPage({
    super.key,
    required this.doctor,
    required this.selectedDate,
    required this.selectedTime,
  });

  static const Color primaryColor = Colors.teal;
  static const Color lightBg = Color(0xFFF8FFFD);

  Widget _defaultAvatar(double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: const Color(0xFFE6F7F5),
        borderRadius: BorderRadius.circular(size * 0.25),
      ),
      child: Icon(Icons.person,
          size: size * 0.55, color: const Color(0xFF00B4A5)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final String fullName = doctor["fullName"] ?? "No Name";
    final String avatar = doctor["avatar"] ?? "";
    final String clinicName = doctor["clinicName"] ?? "—";
    final String clinicAddress = doctor["clinicAddress"] ?? "—";
    final String experience = doctor["experience"] ?? "—";

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
                            Icon(Icons.local_hospital_outlined,
                                size: 14, color: Colors.teal.shade400),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                clinicName,
                                style: TextStyle(
                                    fontSize: 13,
                                    color: Colors.grey.shade700),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(Icons.location_on_outlined,
                                size: 14, color: Colors.grey.shade500),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                clinicAddress,
                                style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey.shade500),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
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
              value: selectedDate,
            ),
            const SizedBox(height: 12),
            _infoCard(
              icon: Icons.access_time,
              title: 'Giờ khám',
              value: selectedTime,
            ),
            const SizedBox(height: 12),
            _infoCard(
              icon: Icons.note_alt_outlined,
              title: 'Lý do khám',
              value: 'Đau tức ngực, khó thở',
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
                  _paymentRow('Phí khám bệnh', '1.400.000 đ'),
                  _paymentRow('Phí hành chính', '50.000 đ'),
                  _paymentRow('Giảm giá ưu đãi', '-200.000 đ'),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Divider(height: 1),
                  ),
                  _paymentRow('Tổng cộng', '1.250.000 đ', isTotal: true),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      const Icon(Icons.credit_card,
                          color: primaryColor, size: 20),
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

            const SizedBox(height: 40),

            // ===== BOOKING BUTTON =====
            Row(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Tổng thanh toán',
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      '1.250.000 đ',
                      style: TextStyle(
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
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: const Row(
                              children: [
                                Icon(Icons.check_circle, color: Colors.white),
                                SizedBox(width: 12),
                                Text(
                                  'Đặt lịch thành công! Bạn sẽ nhận thông báo sớm.',
                                  style:
                                      TextStyle(fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                            backgroundColor: primaryColor,
                            behavior: SnackBarBehavior.floating,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primaryColor,
                        elevation: 10,
                        shadowColor: primaryColor.withOpacity(0.4),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                      ),
                      child: const Text(
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
                style:
                    TextStyle(color: Colors.grey.shade600, fontSize: 14),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                    fontSize: 16, fontWeight: FontWeight.w600),
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
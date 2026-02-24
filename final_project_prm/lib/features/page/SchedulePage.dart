import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../api/appointment_api.dart';

class SchedulePage extends StatefulWidget {
  const SchedulePage({super.key});

  @override
  State<SchedulePage> createState() => _SchedulePageState();
}

class _SchedulePageState extends State<SchedulePage> {
  int selectedTab = 0;

  static const Color primaryColor = Colors.teal;
  static const Color lightBg = Color(0xFFF8FFFD);

  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  List<dynamic> appointments = [];
  bool isLoading = true;
  String? userId;

  final List<String> statuses = ['pending', 'upcoming', 'completed', 'cancelled'];

  @override
  void initState() {
    super.initState();
    loadUserAndFetch();
  }

  Future<void> loadUserAndFetch() async {
    final userStr = await _storage.read(key: "user");
    if (userStr != null) {
      final user = jsonDecode(userStr);
      userId = user["_id"];
    }
    await fetchAppointments();
  }

  Future<void> fetchAppointments({int? tabIndex}) async {
    if (userId == null) return;
    setState(() => isLoading = true);
    try {
      final data = await AppointmentApi.getUserAppointments(
        userId!,
        status: statuses[tabIndex ?? selectedTab],
      );
      setState(() => appointments = data);
    } catch (_) {
      setState(() => appointments = []);
    } finally {
      setState(() => isLoading = false);
    }
  }

  void _showAppointmentDetail(Map<String, dynamic> appointment) {
    final doctor = appointment["doctorId"] as Map<String, dynamic>? ?? {};
    final clinic = appointment["clinicId"] as Map<String, dynamic>? ?? {};
    final String status = appointment["status"] ?? "pending";
    final String time = appointment["appointmentTime"] ?? "—";
    final String reason = appointment["reason"] ?? "—";
    final bool canCancel = status == "pending" || status == "upcoming";

    String date = "—";
    if (appointment["appointmentDate"] != null) {
      final dt = DateTime.tryParse(appointment["appointmentDate"]);
      if (dt != null) date = "${dt.day}/${dt.month}/${dt.year}";
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.82,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
        ),
        child: Column(
          children: [
            // Handle bar
            Padding(
              padding: const EdgeInsets.only(top: 16),
              child: Center(
                child: Container(
                  width: 50,
                  height: 5,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Doctor header
                    Row(
                      children: [
                        Container(
                          width: 70,
                          height: 70,
                          decoration: BoxDecoration(
                            color: const Color(0xFFE6F7F5),
                            borderRadius: BorderRadius.circular(18),
                          ),
                          child: const Icon(Icons.person,
                              size: 40, color: Color(0xFF00B4A5)),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                doctor["fullName"] ?? "—",
                                style: const TextStyle(
                                    fontSize: 18, fontWeight: FontWeight.w700),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                doctor["specialty"] ?? "—",
                                style: TextStyle(
                                    color: Colors.grey.shade600, fontSize: 14),
                              ),
                              const SizedBox(height: 6),
                              _statusBadge(status),
                            ],
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),
                    const Divider(),
                    const SizedBox(height: 16),

                    // Appointment info
                    _sectionTitle('Thông tin lịch hẹn'),
                    const SizedBox(height: 12),
                    _infoCard([
                      _detailRow(Icons.calendar_today, 'Ngày khám', date),
                      const Divider(height: 1),
                      _detailRow(Icons.access_time, 'Giờ khám', time),
                      const Divider(height: 1),
                      _detailRow(Icons.note_alt_outlined, 'Lý do khám', reason),
                    ]),

                    const SizedBox(height: 20),

                    // Clinic info
                    _sectionTitle('Thông tin phòng khám'),
                    const SizedBox(height: 12),
                    _infoCard([
                      _detailRow(
                          Icons.local_hospital_outlined,
                          'Phòng khám',
                          clinic["name"] ?? "—"),
                      const Divider(height: 1),
                      _detailRow(
                          Icons.location_on_outlined,
                          'Địa chỉ',
                          clinic["address"] ?? "—"),
                    ]),

                    const SizedBox(height: 20),

                    // Doctor contact
                    if (doctor["phoneNumber"] != null ||
                        doctor["email"] != null) ...[
                      _sectionTitle('Liên hệ bác sĩ'),
                      const SizedBox(height: 12),
                      _infoCard([
                        if (doctor["phoneNumber"] != null)
                          _detailRow(Icons.phone_outlined, 'Điện thoại',
                              doctor["phoneNumber"]),
                        if (doctor["phoneNumber"] != null &&
                            doctor["email"] != null)
                          const Divider(height: 1),
                        if (doctor["email"] != null)
                          _detailRow(
                              Icons.email_outlined, 'Email', doctor["email"]),
                      ]),
                      const SizedBox(height: 20),
                    ],
                  ],
                ),
              ),
            ),

            // Bottom buttons
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
              child: Row(
                children: [
                  if (canCancel) ...[
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () {
                          Navigator.pop(context);
                          _showCancelConfirmation(context);
                        },
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          side: BorderSide(color: Colors.red.shade300),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        child: Text('Hủy lịch',
                            style: TextStyle(color: Colors.red.shade400)),
                      ),
                    ),
                    const SizedBox(width: 12),
                  ],
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primaryColor,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      child: const Text('Đóng',
                          style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Colors.white)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: lightBg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: Colors.black87,
        title: const Text(
          'Lịch khám của tôi',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // ===== TABS =====
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(30),
            ),
            child: Row(
              children: [
                _tabButton('Chờ duyệt', 0),
                _tabButton('Sắp tới', 1),
                _tabButton('Đã khám', 2),
                _tabButton('Đã hủy', 3),
              ],
            ),
          ),

          const SizedBox(height: 10),

          // ===== BODY =====
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : appointments.isEmpty
                    ? _buildEmpty()
                    : RefreshIndicator(
                        onRefresh: fetchAppointments,
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          itemCount: appointments.length,
                          itemBuilder: (context, index) =>
                              _buildCard(appointments[index]),
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildCard(Map<String, dynamic> appointment) {
    final doctor = appointment["doctorId"] as Map<String, dynamic>? ?? {};
    final clinic = appointment["clinicId"] as Map<String, dynamic>? ?? {};
    final String status = appointment["status"] ?? "pending";
    final String doctorName = doctor["fullName"] ?? "—";
    final String doctorSpecialty = doctor["specialty"] ?? "—";
    final String time = appointment["appointmentTime"] ?? "—";
    final String clinicName = clinic["name"] ?? "—";
    final bool canCancel = status == "pending" || status == "upcoming";

    String date = "—";
    if (appointment["appointmentDate"] != null) {
      final dt = DateTime.tryParse(appointment["appointmentDate"]);
      if (dt != null) date = "${dt.day}/${dt.month}/${dt.year}";
    }

    return GestureDetector(
      onTap: () => _showAppointmentDetail(appointment),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          children: [
            // Header màu theo status
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: _statusColor(status).withOpacity(0.08),
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(Icons.calendar_today,
                          size: 13, color: Colors.grey.shade600),
                      const SizedBox(width: 6),
                      Text(
                        "$date  ·  $time",
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey.shade700,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  _statusBadge(status),
                ],
              ),
            ),

            // Body
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          color: const Color(0xFFE6F7F5),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Icon(Icons.person,
                            size: 32, color: Color(0xFF00B4A5)),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              doctorName,
                              style: const TextStyle(
                                  fontSize: 16, fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              doctorSpecialty,
                              style: TextStyle(
                                  color: Colors.grey.shade600, fontSize: 13),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Icon(Icons.local_hospital_outlined,
                                    size: 13, color: Colors.teal.shade300),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    clinicName,
                                    style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey.shade500),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      Icon(Icons.chevron_right,
                          color: Colors.grey.shade400, size: 20),
                    ],
                  ),

                  if (canCancel) ...[
                    const SizedBox(height: 14),
                    const Divider(height: 1),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => _showCancelConfirmation(context),
                            style: OutlinedButton.styleFrom(
                              padding:
                                  const EdgeInsets.symmetric(vertical: 10),
                              side: BorderSide(color: Colors.red.shade200),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: Text('Hủy lịch',
                                style:
                                    TextStyle(color: Colors.red.shade400)),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {},
                            style: ElevatedButton.styleFrom(
                              backgroundColor: primaryColor,
                              padding:
                                  const EdgeInsets.symmetric(vertical: 10),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: const Text('Đổi lịch',
                                style: TextStyle(color: Colors.white)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _statusBadge(String status) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: _statusColor(status).withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        _statusLabel(status),
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: _statusColor(status),
        ),
      ),
    );
  }

  Widget _sectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
    );
  }

  Widget _infoCard(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(children: children),
    );
  }

  Widget _detailRow(IconData icon, String label, String value,
      {Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Icon(icon, color: color ?? Colors.grey.shade500, size: 18),
          const SizedBox(width: 12),
          Text(label,
              style:
                  TextStyle(color: Colors.grey.shade600, fontSize: 13)),
          const Spacer(),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 13,
                color: color ?? Colors.black87,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmpty() {
    final List<String> messages = [
      'Chưa có lịch chờ duyệt',
      'Bạn chưa có lịch khám sắp tới',
      'Chưa có lịch đã khám',
      'Chưa có lịch nào bị hủy',
    ];
    final List<IconData> icons = [
      Icons.hourglass_empty_outlined,
      Icons.event_available,
      Icons.check_circle_outline,
      Icons.cancel_outlined,
    ];

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icons[selectedTab], size: 80, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          Text(
            messages[selectedTab],
            style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
          ),
        ],
      ),
    );
  }

  Widget _tabButton(String title, int index) {
    final bool isSelected = selectedTab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() => selectedTab = index);
          fetchAppointments(tabIndex: index);
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? primaryColor : Colors.transparent,
            borderRadius: BorderRadius.circular(30),
          ),
          child: Text(
            title,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              color: isSelected ? Colors.white : Colors.grey.shade600,
              fontWeight:
                  isSelected ? FontWeight.w600 : FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }

  void _showCancelConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24)),
        title: const Text('Xác nhận hủy lịch?'),
        content: const Text(
            'Bạn có chắc chắn muốn hủy lịch khám này không?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Không'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Đã hủy lịch khám thành công'),
                  backgroundColor: Colors.red,
                ),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Hủy lịch',
                style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'upcoming':
        return 'Sắp tới';
      case 'completed':
        return 'Đã khám';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'pending':
        return Colors.orange;
      case 'upcoming':
        return Colors.blue;
      case 'completed':
        return Colors.teal;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}
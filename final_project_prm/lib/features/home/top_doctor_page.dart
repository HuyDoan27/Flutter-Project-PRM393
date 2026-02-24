import 'package:flutter/material.dart';
import '../../api/doctor_api.dart';

class TopDoctorPage extends StatefulWidget {
  const TopDoctorPage({super.key});

  @override
  State<TopDoctorPage> createState() => _TopDoctorPageState();
}

class _TopDoctorPageState extends State<TopDoctorPage> {
  List<dynamic> doctors = [];
  bool isLoading = true;
  String? error;
  final TextEditingController searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    fetchDoctors();
  }

  Future<void> fetchDoctors({String? name}) async {
    setState(() {
      isLoading = true;
      error = null;
    });

    try {
      final data = await DoctorApi.getDoctors(name: name);
      setState(() {
        doctors = data;
      });
    } catch (e) {
      setState(() {
        error = "Failed to load doctors";
      });
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  void _showDoctorDetail(Map<String, dynamic> doctor) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.75,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (_, scrollController) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: ListView(
            controller: scrollController,
            padding: const EdgeInsets.all(24),
            children: [
              // Handle bar
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Avatar + Name
              Center(
                child: Column(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(20),
                      child: doctor["avatar"] != null
                          ? Image.network(
                              doctor["avatar"],
                              width: 100,
                              height: 100,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => _defaultAvatar(),
                            )
                          : _defaultAvatar(),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      doctor["fullName"] ?? "No Name",
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      doctor["experience"] ?? "",
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.teal.shade400,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 16),

              _detailSection(
                icon: Icons.local_hospital_outlined,
                iconColor: Colors.teal,
                title: "Phòng khám",
                content: doctor["clinicName"] ?? "—",
              ),
              const SizedBox(height: 12),
              _detailSection(
                icon: Icons.location_on_outlined,
                iconColor: Colors.redAccent,
                title: "Địa chỉ",
                content: doctor["clinicAddress"] ?? "—",
              ),
              const SizedBox(height: 12),
              _detailSection(
                icon: Icons.email_outlined,
                iconColor: Colors.blueAccent,
                title: "Email",
                content: doctor["email"] ?? "—",
              ),
              const SizedBox(height: 12),
              _detailSection(
                icon: Icons.phone_outlined,
                iconColor: Colors.green,
                title: "Số điện thoại",
                content: doctor["phoneNumber"] ?? "—",
              ),

              // Qualifications
              if (doctor["qualifications"] != null &&
                  (doctor["qualifications"] as List).isNotEmpty) ...[
                const SizedBox(height: 20),
                const Divider(),
                const SizedBox(height: 16),
                const Text(
                  "Bằng cấp & Chứng chỉ",
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 10),
                ...List<String>.from(doctor["qualifications"]).map(
                  (q) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          Icons.verified,
                          size: 16,
                          color: Color(0xFF00B4A5),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            q,
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey.shade700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],

              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    // TODO: navigate to booking page
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00B4A5),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    "Đặt lịch khám",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _detailSection({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String content,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: iconColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 18, color: iconColor),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
              ),
              const SizedBox(height: 2),
              Text(
                content,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _defaultAvatar() {
    return Container(
      width: 70,
      height: 70,
      decoration: BoxDecoration(
        color: const Color(0xFFE6F7F5),
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Icon(Icons.person, size: 40, color: Color(0xFF00B4A5)),
    );
  }

  Widget buildDoctorItem(Map<String, dynamic> doctor) {
    return GestureDetector(
      onTap: () => _showDoctorDetail(doctor),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey.shade200),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.shade100,
              blurRadius: 6,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          children: [
            // Avatar
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: doctor["avatar"] != null
                  ? Image.network(
                      doctor["avatar"],
                      width: 70,
                      height: 70,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => _defaultAvatar(),
                    )
                  : _defaultAvatar(),
            ),
            const SizedBox(width: 16),

            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    doctor["fullName"] ?? "No Name",
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(
                        Icons.local_hospital_outlined,
                        size: 13,
                        color: Colors.teal.shade400,
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          doctor["clinicName"] ?? "Unknown Clinic",
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(
                        Icons.location_on_outlined,
                        size: 13,
                        color: Colors.grey.shade400,
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          doctor["clinicAddress"] ?? "",
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade500,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(
                        Icons.workspace_premium_outlined,
                        size: 13,
                        color: Colors.amber.shade600,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        doctor["experience"] ?? "",
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade500,
                        ),
                      ),
                    ],
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
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text("Top Doctors"),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Search
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: searchController,
              onSubmitted: (value) => fetchDoctors(name: value),
              decoration: InputDecoration(
                hintText: "Search doctor...",
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.grey.shade100,
                contentPadding: const EdgeInsets.symmetric(
                  vertical: 0,
                  horizontal: 16,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(30),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          // Body
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : error != null
                ? Center(child: Text(error!))
                : doctors.isEmpty
                ? const Center(child: Text("No doctors found"))
                : RefreshIndicator(
                    onRefresh: () => fetchDoctors(),
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: doctors.length,
                      itemBuilder: (context, index) {
                        return buildDoctorItem(doctors[index]);
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import '../../api/doctor_api.dart';
import './DoctorDetail.dart';

class Doctor {
  final String name;
  final String specialty;
  final String imageUrl;
  final double rating;
  final String distance;

  Doctor({
    required this.name,
    required this.specialty,
    required this.imageUrl,
    required this.rating,
    required this.distance,
  });
}

class FindDoctorsPage extends StatefulWidget {
  const FindDoctorsPage({super.key});

  @override
  State<FindDoctorsPage> createState() => _FindDoctorsPageState();
}

class _FindDoctorsPageState extends State<FindDoctorsPage> {
  static const Color primaryColor = Colors.teal;
  static const Color lightBg = Color(0xFFF8FFFD);

  List<dynamic> featuredDoctors = [];
  List<dynamic> otherDoctors = [];
  bool isFeaturedLoading = true;
  bool isOtherLoading = true;

  @override
  void initState() {
    super.initState();
    fetchFeaturedDoctors();
    fetchOtherDoctors();
  }

  Future<void> fetchFeaturedDoctors() async {
    try {
      final data = await DoctorApi.getRandomDoctors();
      setState(() => featuredDoctors = data);
    } catch (_) {
    } finally {
      setState(() => isFeaturedLoading = false);
    }
  }

  Future<void> fetchOtherDoctors() async {
    try {
      final data = await DoctorApi.getRandomDoctors();
      setState(() => otherDoctors = data);
    } catch (_) {
    } finally {
      setState(() => isOtherLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: lightBg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: Colors.black,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Tìm bác sĩ',
          style: TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 18,
            color: Colors.black87,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 12),

              // Search Bar
              TextField(
                decoration: InputDecoration(
                  hintText: 'Tìm bác sĩ, chuyên khoa, bệnh viện...',
                  hintStyle: TextStyle(
                    color: Colors.grey.shade500,
                    fontSize: 15,
                  ),
                  prefixIcon: const Icon(
                    Icons.search,
                    color: primaryColor,
                    size: 22,
                  ),
                  suffixIcon: const Icon(Icons.mic_none, color: primaryColor),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(vertical: 18),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(18),
                    borderSide: BorderSide.none,
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(18),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(18),
                    borderSide: const BorderSide(
                      color: primaryColor,
                      width: 1.5,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 28),

              // Category
              const Text(
                'Chuyên khoa',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 16),
              _categoryGrid(),
              const SizedBox(height: 28),

              // Featured Doctors
              const Text(
                'Bác sĩ nổi bật',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 12),
              isFeaturedLoading
                  ? const Center(child: CircularProgressIndicator())
                  : featuredDoctors.isEmpty
                  ? const Center(child: Text("Không có dữ liệu"))
                  : Column(
                      children: featuredDoctors
                          .map((d) => _doctorCard(context, d))
                          .toList(),
                    ),

              const SizedBox(height: 28),

              // Other Doctors
              const Text(
                'Bác sĩ khác mà bạn có thể quan tâm',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 16),
              isOtherLoading
                  ? const Center(child: CircularProgressIndicator())
                  : otherDoctors.isEmpty
                  ? const Center(child: Text("Không có dữ liệu"))
                  : _otherDoctorsList(),

              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  // ===================== CATEGORY GRID =====================
  Widget _categoryGrid() {
    final List<Map<String, dynamic>> categories = [
      {'icon': Icons.local_hospital, 'label': 'Nội tổng quát'},
      {'icon': Icons.air, 'label': 'Hô hấp'},
      {'icon': Icons.face, 'label': 'Nha khoa'},
      {'icon': Icons.psychology, 'label': 'Tâm lý'},
      {'icon': Icons.masks, 'label': 'Covid-19'},
      {'icon': Icons.healing, 'label': 'Ngoại khoa'},
      {'icon': Icons.favorite, 'label': 'Tim mạch'},
      {'icon': Icons.child_care, 'label': 'Nhi khoa'},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: categories.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        mainAxisSpacing: 20,
        crossAxisSpacing: 16,
        childAspectRatio: 0.9,
      ),
      itemBuilder: (context, index) {
        final item = categories[index];
        return Column(
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: primaryColor.withOpacity(0.12),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: primaryColor.withOpacity(0.15),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Icon(item['icon'], color: primaryColor, size: 28),
            ),
            const SizedBox(height: 8),
            Text(
              item['label'],
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
              textAlign: TextAlign.center,
              maxLines: 2,
            ),
          ],
        );
      },
    );
  }

  // ===================== FEATURED DOCTOR CARD =====================
  Widget _doctorCard(BuildContext context, Map<String, dynamic> doctor) {
    return GestureDetector(
      onTap: () {
        // ✅ Truyền doctor object hoàn chỉnh
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => DoctorDetailPage(doctor: doctor),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.15),
              blurRadius: 15,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: doctor["avatar"] != null
                  ? Image.network(
                      doctor["avatar"],
                      width: 72,
                      height: 72,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => _defaultAvatar(72),
                    )
                  : _defaultAvatar(72),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    doctor["fullName"] ?? "No Name",
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    doctor["clinicName"] ?? "Unknown",
                    style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
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
                          doctor["clinicAddress"] ?? "",
                          style: TextStyle(
                            color: Colors.grey.shade500,
                            fontSize: 12,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE6F7F5),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      doctor["experience"] ?? "",
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF00B4A5),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.arrow_forward_ios,
              size: 16,
              color: Colors.grey.shade400,
            ),
          ],
        ),
      ),
    );
  }

  // ===================== OTHER DOCTORS LIST =====================
  Widget _otherDoctorsList() {
    return SizedBox(
      height: 100,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: otherDoctors.length,
        separatorBuilder: (_, __) => const SizedBox(width: 20),
        itemBuilder: (context, index) {
          final doctor = otherDoctors[index];
          final name = (doctor["fullName"] ?? "").toString().split(' ').last;
          
          return GestureDetector(
            onTap: () {
              // ✅ Truyền doctor object khi tap
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => DoctorDetailPage(doctor: doctor),
                ),
              );
            },
            child: Column(
              children: [
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.2),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: doctor["avatar"] != null
                        ? Image.network(
                            doctor["avatar"],
                            width: 60,
                            height: 60,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => _defaultAvatar(60),
                          )
                        : _defaultAvatar(60),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  name,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _defaultAvatar(double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: const Color(0xFFE6F7F5),
        borderRadius: BorderRadius.circular(size * 0.27),
      ),
      child: Icon(
        Icons.person,
        size: size * 0.55,
        color: const Color(0xFF00B4A5),
      ),
    );
  }
}
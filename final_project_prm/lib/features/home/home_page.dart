import 'package:flutter/material.dart';
import '../../api/doctor_api.dart';
import './top_doctor_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  List<dynamic> randomDoctors = [];
  bool isDoctorLoading = true;

  @override
  void initState() {
    super.initState();
    fetchRandomDoctors();
  }

  Future<void> fetchRandomDoctors() async {
    try {
      final data = await DoctorApi.getRandomDoctors();
      setState(() {
        randomDoctors = data;
      });
    } catch (e) {
      // fail silently
    } finally {
      setState(() {
        isDoctorLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Section
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Find your desire',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              'health solution',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.grey.shade300),
                          ),
                          child: const Icon(Icons.notifications_none),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Search Bar
                    InkWell(
                      borderRadius: BorderRadius.circular(30),
                      onTap: () {
                        Navigator.pushNamed(context, '/find-doctors');
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(30),
                        ),
                        child: const TextField(
                          enabled: false,
                          decoration: InputDecoration(
                            hintText: 'Search doctor, drugs, articles...',
                            border: InputBorder.none,
                            icon: Icon(Icons.search, color: Colors.grey),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Category Icons
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildCategoryIcon(Icons.person_outline, 'Doctor'),
                    _buildCategoryIcon(
                        Icons.medical_services_outlined, 'Pharmacy'),
                    _buildCategoryIcon(
                        Icons.local_hospital_outlined, 'Hospital'),
                    _buildCategoryIcon(
                        Icons.local_shipping_outlined, 'Ambulance'),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Banner
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF4DD0C1), Color(0xFF00B4A5)],
                    ),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Early protection for',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const Text(
                              'your family health',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: () {},
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: const Color(0xFF00B4A5),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 24,
                                  vertical: 10,
                                ),
                              ),
                              child: const Text('Learn more'),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        width: 80,
                        height: 100,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Image.network(
                            'https://via.placeholder.com/80x100',
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return const Icon(Icons.person,
                                  size: 60, color: Colors.grey);
                            },
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Top Doctor Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Top Doctor',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const TopDoctorPage(),
                          ),
                        );
                      },
                      child: const Text(
                        'See all',
                        style: TextStyle(color: Color(0xFF00B4A5)),
                      ),
                    ),
                  ],
                ),
              ),

              SizedBox(
                height: 200,
                child: isDoctorLoading
                    ? const Center(child: CircularProgressIndicator())
                    : randomDoctors.isEmpty
                        ? const Center(child: Text("No doctors available"))
                        : ListView.builder(
                            scrollDirection: Axis.horizontal,
                            padding:
                                const EdgeInsets.symmetric(horizontal: 24),
                            itemCount: randomDoctors.length,
                            itemBuilder: (context, index) {
                              return _buildDoctorCard(randomDoctors[index]);
                            },
                          ),
              ),
              const SizedBox(height: 24),

              // Health Article Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Health article',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    TextButton(
                      onPressed: () {},
                      child: const Text(
                        'See all',
                        style: TextStyle(color: Color(0xFF00B4A5)),
                      ),
                    ),
                  ],
                ),
              ),

              // Article Cards
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: Column(
                  children: [
                    _buildArticleCard(
                      'Covid-19',
                      'Coronavirus: Symptoms, Prevention & Treatment',
                      'Jun 10, 2021',
                      '5 min read',
                      Colors.red.shade50,
                      Colors.red.shade600,
                    ),
                    const SizedBox(height: 12),
                    _buildArticleCard(
                      'Diet',
                      'Healthy Eating Habits for Better Life',
                      'Jun 12, 2021',
                      '8 min read',
                      Colors.green.shade50,
                      Colors.green.shade600,
                    ),
                    const SizedBox(height: 12),
                    _buildArticleCard(
                      'Mental Health',
                      'Managing Stress in Daily Life',
                      'Jun 15, 2021',
                      '6 min read',
                      Colors.purple.shade50,
                      Colors.purple.shade600,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 100),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryIcon(IconData icon, String label) {
    return Column(
      children: [
        Container(
          width: 56,
          height: 56,
          decoration: const BoxDecoration(
            color: Color(0xFFE3F2FD),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: const Color(0xFF00B4A5), size: 28),
        ),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ],
    );
  }

  Widget _buildDoctorCard(Map<String, dynamic> doctor) {
    return Container(
      width: 140,
      margin: const EdgeInsets.only(right: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.shade200,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Avatar
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: doctor["avatar"] != null
                ? Image.network(
                    doctor["avatar"],
                    width: 60,
                    height: 60,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => _defaultAvatarSmall(),
                  )
                : _defaultAvatarSmall(),
          ),
          const SizedBox(height: 8),

          // Name
          Text(
            doctor["fullName"] ?? "No Name",
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),

          // Clinic
          Text(
            doctor["clinicName"] ?? "Unknown",
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 10, color: Colors.grey.shade600),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 6),

          // Experience badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: const Color(0xFFE6F7F5),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              doctor["experience"] ?? "",
              style: const TextStyle(
                fontSize: 9,
                color: Color(0xFF00B4A5),
                fontWeight: FontWeight.w500,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _defaultAvatarSmall() {
    return Container(
      width: 60,
      height: 60,
      decoration: BoxDecoration(
        color: const Color(0xFFE6F7F5),
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Icon(Icons.person, size: 32, color: Color(0xFF00B4A5)),
    );
  }

  Widget _buildArticleCard(
    String tag,
    String title,
    String date,
    String readTime,
    Color tagBgColor,
    Color tagTextColor,
  ) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          // Article Image
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  tagTextColor.withOpacity(0.3),
                  tagTextColor.withOpacity(0.1),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                bottomLeft: Radius.circular(16),
              ),
            ),
            child:
                Icon(Icons.article_outlined, size: 40, color: tagTextColor),
          ),

          // Article Info
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: tagBgColor,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      tag,
                      style: TextStyle(
                        fontSize: 10,
                        color: tagTextColor,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      height: 1.3,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.calendar_today,
                          size: 10, color: Colors.grey.shade500),
                      const SizedBox(width: 4),
                      Text(date,
                          style: TextStyle(
                              fontSize: 10, color: Colors.grey.shade600)),
                      const SizedBox(width: 8),
                      Icon(Icons.access_time,
                          size: 10, color: Colors.grey.shade500),
                      const SizedBox(width: 4),
                      Text(readTime,
                          style: TextStyle(
                              fontSize: 10, color: Colors.grey.shade600)),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../api/auth_api.dart';
import '../../api/user_api.dart';
import '../../routes/route_names.dart';
import './SchedulePage.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  static const Color primaryColor = Colors.teal;
  static const Color lightBg = Color(0xFFF0FFFE);

  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Map<String, dynamic>? user;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchUser();
  }

  Future<void> fetchUser() async {
    try {
      final data = await UserApi.getUser();
      setState(() => user = data);
    } catch (_) {
      // Nếu lỗi thì đọc từ storage
      final userStr = await _storage.read(key: "user");
      if (userStr != null) {
        setState(() => user = jsonDecode(userStr));
      }
    } finally {
      setState(() => isLoading = false);
    }
  }

  Future<void> _handleLogout() async {
    try {
      await AuthApi.logout();
    } catch (_) {
      // Dù API lỗi vẫn xóa storage và về login
    } finally {
      await _storage.deleteAll();
      if (!mounted) return;
      Navigator.pushNamedAndRemoveUntil(
        context,
        RouteNames.login,
        (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final String fullName = user?["fullName"] ?? "Người dùng";
    final String? avatar = user?["avatar"];
    final String email = user?["email"] ?? "—";
    final String phone = user?["phoneNumber"] ?? "—";
    final String role = user?["role"] ?? "user";

    return Scaffold(
      backgroundColor: lightBg,
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : SafeArea(
              child: Column(
                children: [
                  // ===== HEADER =====
                  Container(
                    padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
                    decoration: const BoxDecoration(
                      color: primaryColor,
                      borderRadius: BorderRadius.only(
                        bottomLeft: Radius.circular(32),
                        bottomRight: Radius.circular(32),
                      ),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.more_vert,
                                  color: Colors.white),
                              onPressed: () {},
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),

                        // Avatar
                        Stack(
                          children: [
                            CircleAvatar(
                              radius: 50,
                              backgroundColor: const Color(0xFFE6F7F5),
                              backgroundImage: avatar != null && avatar.isNotEmpty
                                  ? NetworkImage(avatar)
                                  : null,
                              child: avatar == null || avatar.isEmpty
                                  ? const Icon(Icons.person,
                                      size: 50, color: Colors.white)
                                  : null,
                            ),
                            Positioned(
                              bottom: 0,
                              right: 0,
                              child: Container(
                                padding: const EdgeInsets.all(6),
                                decoration: const BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.camera_alt,
                                    size: 20, color: primaryColor),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 12),

                        Text(
                          fullName,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),

                        // Role badge
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            role == "doctor" ? "Bác sĩ" : "Bệnh nhân",
                            style: const TextStyle(
                              fontSize: 13,
                              color: Colors.white,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),

                        const SizedBox(height: 24),

                        // Email + Phone info
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: _headerInfo(
                                    Icons.email_outlined, "Email", email),
                              ),
                              Container(
                                width: 1,
                                height: 40,
                                color: Colors.white30,
                              ),
                              Expanded(
                                child: _headerInfo(
                                    Icons.phone_outlined, "Điện thoại", phone),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // ===== MENU LIST =====
                  Expanded(
                    child: ListView(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      children: [
                        _menuItem(
                          context,
                          icon: Icons.bookmark_border,
                          title: 'My Saved',
                          onTap: () {},
                        ),
                        _menuItem(
                          context,
                          icon: Icons.calendar_today_outlined,
                          title: 'Appointment',
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (_) => const SchedulePage()),
                            );
                          },
                        ),
                        _menuItem(
                          context,
                          icon: Icons.credit_card,
                          title: 'Payment Method',
                          onTap: () {},
                        ),
                        _menuItem(
                          context,
                          icon: Icons.help_outline,
                          title: 'FAQs',
                          onTap: () {},
                        ),
                        _menuItem(
                          context,
                          icon: Icons.logout,
                          title: 'Logout',
                          color: Colors.red.shade600,
                          onTap: () => _showLogoutDialog(context),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _headerInfo(IconData icon, String label, String value) {
    return Column(
      children: [
        Icon(icon, color: Colors.white70, size: 20),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: Colors.white60),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(
            fontSize: 12,
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _menuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    Color? color,
    required VoidCallback onTap,
  }) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(vertical: 8),
      leading: Icon(icon, color: color ?? primaryColor, size: 26),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: color ?? Colors.black87,
        ),
      ),
      trailing: Icon(Icons.arrow_forward_ios,
          size: 16, color: Colors.grey.shade400),
      onTap: onTap,
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
        child: Container(
          padding: const EdgeInsets.all(32),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(32),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: primaryColor.withOpacity(0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.logout, size: 40, color: primaryColor),
              ),
              const SizedBox(height: 24),
              const Text(
                'Are you sure to log out of\nyour account?',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 32),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: BorderSide(color: Colors.grey.shade300),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                      ),
                      child: const Text(
                        'Cancel',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        _handleLogout();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primaryColor,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                      ),
                      child: const Text(
                        'Log Out',
                        style: TextStyle(
                            fontWeight: FontWeight.w700, color: Colors.white),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
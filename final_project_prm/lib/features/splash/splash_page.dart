import 'package:flutter/material.dart';
import '../../routes/route_names.dart';

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {
  @override
  void initState() {
    super.initState();

    Future.delayed(const Duration(seconds: 2), () {
      Navigator.pushReplacementNamed(
        context,
        RouteNames.onboarding, // màn hình onboarding
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        color: Colors.green, // background xanh lá
        child: Center(
          child: Image.asset(
            'assets/images/logo.png',
            width: 160,
            fit: BoxFit.contain,
          ),
        ),
      ),
    );
  }
}

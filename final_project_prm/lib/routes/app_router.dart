import 'package:flutter/material.dart';
import '../features/splash/splash_page.dart';
import '../features/onboarding/onboarding_page.dart';
import '../features/onboarding/onboarding_last.dart';
import '../features/auth/login_page.dart';
import '../features/auth/register_page.dart';
import '../features/home/home_page.dart';
import '../features/home/main_tab.dart';
import '../features/page/FindDoctors.dart';
import 'route_names.dart';

class AppRouter {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case RouteNames.splash:
        return MaterialPageRoute(builder: (_) => const SplashPage());

      case RouteNames.onboarding:
        return MaterialPageRoute(builder: (_) => const OnboardingPage());

      case RouteNames.getStarted:
        // Assuming GetStartedPage is defined elsewhere
        return MaterialPageRoute(builder: (_) => GetStartedPage());

      case RouteNames.login:
        return MaterialPageRoute(builder: (_) => LoginPage());

      case RouteNames.signup:
        return MaterialPageRoute(builder: (_) => SignUpPage());

      case RouteNames.home:
        return MaterialPageRoute(builder: (_) => const HomePage());

      case RouteNames.main:
        return MaterialPageRoute(builder: (_) => const MainTab());

      case RouteNames.findDoctors:
        return MaterialPageRoute(builder: (_) => const FindDoctorsPage());

      default:
        return MaterialPageRoute(
          builder: (_) =>
              const Scaffold(body: Center(child: Text('404 - Page not found'))),
        );
    }
  }
}

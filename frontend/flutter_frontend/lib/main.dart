import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_frontend/services/token_storage.dart';
import 'services/token_storage.dart';
import 'home_route.dart';
import 'services/app_navigation.dart';
import 'package:http/http.dart' as http;
import 'register_route.dart';
import 'login_route.dart';
void main() {
  runApp(const ChatApp());
}

class ChatApp extends StatelessWidget {
  const ChatApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Chat Application',
      theme: ThemeData(primarySwatch: Colors.blue),
      navigatorKey: appNavigatorKey,
      home: const AuthGate(),
    );
  }

  
}

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<String?>(
      future: TokenStorage.read(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const CircularProgressIndicator();
        } else if (snapshot.hasError) {
          return const Text('Error loading token');
        } else {
          final token = snapshot.data;
          if (token != null) {
            return const HomePage();
          } else {
            return const MainPage();
          }
        }
      },
    );
  }
}

class MainPage extends StatelessWidget {
  const MainPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Main Page'),
        actions: [
          IconButton(
            icon: const Icon(Icons.login),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const LoginRoute()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.app_registration),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const RegisterPage()),
              );
            },
          ),
        ],
      ),
      body: const Text('Welcome to my Chat Application! Please log in or register to continue.'),
    );
  }
}

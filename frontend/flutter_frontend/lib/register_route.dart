import 'dart:async';
import 'dart:convert';

import 'login_route.dart';
import 'services/token_storage.dart';

import 'package:flutter/material.dart';

import 'home_route.dart';

import 'package:http/http.dart' as http;

export 'register_route.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _obscurePassword = true;

  String _responseMessage = '';

  Future<bool> _register() async {
    try {
      final String username = _usernameController.text;
      final String password = _passwordController.text;
      final response = await http.post(
        Uri.parse('http://localhost:3000/auth/register'),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode(<String, String>{
          'username': username,
          'password': password,
        }),
      );
      final responsebody = jsonDecode(response.body);
      if (response.statusCode == 200) {
        setState(() {
          _responseMessage = 'Registration successful! ${response.body}';
        });
        TokenStorage.save(responsebody['token']);
        return true;
      }
      if (!mounted) return false;
      setState(() {
        _responseMessage =
            'Registration failed: ${responsebody['message'] ?? 'Unknown error'}';
      });
      return false;
    } catch (e) {
      if (!mounted) return false;
      setState(() {
        _responseMessage = 'Registration failed: $e';
      });
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Register'),
        actions: [
          IconButton(
            icon: const Icon(Icons.login),
            onPressed: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => const LoginRoute()),
              );
            },
          ),
        ],
      ),
      body: registrationForm(),
    );
  }

  Widget registrationForm() {
    return Form(
      key: _formKey,
      child: Column(
        spacing: 20,

        children: <Widget>[
          TextFormField(
            controller: _usernameController,
            decoration: const InputDecoration(labelText: 'Username'),
            autovalidateMode: AutovalidateMode.onUserInteraction,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter a username';
              }
              if (value.length < 3) {
                return 'Username must be at least 3 characters long';
              }
              if (!RegExp(r'^[a-zA-Z0-9]+$').hasMatch(value)) {
                return 'Username can only contain letters and numbers';
              }
              if (value.length > 20) {
                return 'Username cannot be longer than 20 characters';
              }
              return null;
            },
          ),
          TextFormField(
            controller: _passwordController,

            obscureText: _obscurePassword,
            autovalidateMode: AutovalidateMode.onUserInteraction,
            decoration: InputDecoration(
              labelText: 'Password',
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePassword ? Icons.visibility : Icons.visibility_off,
                ),
                onPressed: () {
                  setState(() {
                    _obscurePassword = !_obscurePassword;
                  });
                },
              ),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter a password';
              }
              if (value.length < 6) {
                return 'Password must be at least 6 characters long';
              }
              return null;
            },
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () async {
              if (_formKey.currentState!.validate()) {
                final registered = await _register();
                if (!mounted) return;
                if (registered) {
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (context) => const HomePage()),
                    (route) => false,
                  );
                }
              }
            },

            child: const Text('Register'),
          ),
          const SizedBox(height: 20),
          Text(_responseMessage),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}

import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_frontend/services/app_navigation.dart';
import 'package:flutter_frontend/services/token_storage.dart';
import 'package:flutter/material.dart';
import 'package:flutter_frontend/login_route.dart';
class ApiWrapper {
  static const String baseUrl = 'http://localhost:3000/';
  static final http.Client client = http.Client();

  ApiWrapper._();




  static Future<http.Response?> get(String endpoint) async {
    final response = await client.get(Uri.parse(baseUrl + endpoint), headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ${await TokenStorage.read()}',
    });

    final currentState = appNavigatorKey.currentState;
    if(response.statusCode == 401) {
      TokenStorage.delete();
      currentState?.pushAndRemoveUntil(MaterialPageRoute(builder: (context) => const LoginRoute()), (route) => false);
    }
    if(response.statusCode >= 400 && response.statusCode < 600) {
      final errorMessage = jsonDecode(response.body)['message'] ?? 'Unknown error';
      currentState?.push(MaterialPageRoute(builder: (context) => SnackBar(content: Text(errorMessage))));
    }
    return response;
  }


  static Future<http.Response?> post(String endpoint, {Map<String, dynamic>? body}) async {
    final response = await client.post(Uri.parse(baseUrl + endpoint),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${await TokenStorage.read()}',
        },
        body: jsonEncode(body));
    final currentState = appNavigatorKey.currentState;
    if(response.statusCode == 401) {
      TokenStorage.delete();
      currentState?.pushAndRemoveUntil(MaterialPageRoute(builder: (context) => const LoginRoute()), (route) => false);
    }
    if(response.statusCode >= 400 && response.statusCode < 600) {
      final errorMessage = jsonDecode(response.body)['message'] ?? 'Unknown error';
      currentState?.push(MaterialPageRoute(builder: (context) => SnackBar(content: Text(errorMessage))));
    }
    return response;
  }

  static Future<http.Response?> put(String endpoint, {Map<String, dynamic>? body}) async {
    final response = await client.put(Uri.parse(baseUrl + endpoint),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${await TokenStorage.read()}',
        },
        body: jsonEncode(body));
    final currentState = appNavigatorKey.currentState;
    if(response.statusCode == 401) {
      TokenStorage.delete();
      currentState?.pushAndRemoveUntil(MaterialPageRoute(builder: (context) => const LoginRoute()), (route) => false);
    }
    if(response.statusCode >= 400 && response.statusCode < 600) {
      final errorMessage = jsonDecode(response.body)['message'] ?? 'Unknown error';
      currentState?.push(MaterialPageRoute(builder: (context) => SnackBar(content: Text(errorMessage))));
    }
    return response;
  }
  

  static Future<http.Response?> delete(String endpoint) async {
    final response = await client.delete(Uri.parse(baseUrl + endpoint), headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ${await TokenStorage.read()}',
    });
    final currentState = appNavigatorKey.currentState;
    if(response.statusCode == 401) {
      TokenStorage.delete();
      currentState?.pushAndRemoveUntil(MaterialPageRoute(builder: (context) => const LoginRoute()), (route) => false);
    }
    if(response.statusCode >= 400 && response.statusCode < 600) {
      final errorMessage = jsonDecode(response.body)['message'] ?? 'Unknown error';
      currentState?.push(MaterialPageRoute(builder: (context) => SnackBar(content: Text(errorMessage))));
    }
    return response;
  }

}

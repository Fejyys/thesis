import 'dart:async';
import 'dart:convert';
import 'main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_frontend/services/user_data.dart';
import 'widgets/channels.dart';
import 'services/api_wrapper.dart';
import 'services/token_storage.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late UserData userData;

  @override
  void initState() {
    super.initState();



    ApiWrapper.get('users/profile').then(
      (response) => {
        if(response != null)
        {
          setState(() => 
          userData = UserData.fromJson(jsonDecode(response.body))  
          )
        }
      }
    );

  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Home Page'),
      actions: [
        IconButton(
          icon: const Icon(Icons.logout),
          onPressed: () async {
            await TokenStorage.delete();
            if (!context.mounted) return;
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => const MainPage()),
            );
          },
        ),
      ],
      ),
     body: Center(child: Channels()),
    );
  }
}

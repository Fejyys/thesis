import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_frontend/services/api_wrapper.dart';

class Channels extends StatefulWidget {
  const Channels({super.key});
  @override
  State<Channels> createState() => _ChannelsState();
}

class _ChannelsState extends State<Channels> {
  dynamic channels;

  @override
  void initState() {
    super.initState();

   ApiWrapper.get('channels').then(
      (response) => {
        if (response != null) {setState(() =>  channels = jsonDecode(response.body))},
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(children: [Text(jsonEncode(channels))]);
  }
}

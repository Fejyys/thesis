
import 'dart:convert';

enum Status { active, inactive, busy, offline }

class UserData {
  int id;
  String username;
  String nickname;
  Status status;
  String statusMessage;
  DateTime? lastLogin;

  UserData({
    required this.username,
    required this.id,
    required this.nickname,
    required this.status,
    required this.statusMessage,
    required DateTime? lastLogin,
  });

  factory UserData.fromJson(Map<String,dynamic> json) {
    return UserData(
      username: json['username'],
      id: json['id'],
      nickname: json['nickname'] ?? '',
      status: Status.values.byName(json['status']),
      statusMessage: json['status_message'] ?? '',
      lastLogin: DateTime.parse(json['_last_login']).toUtc(),
    );
  }

}


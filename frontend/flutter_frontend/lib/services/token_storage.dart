import 'package:flutter_secure_storage/flutter_secure_storage.dart';


class TokenStorage {
  static const FlutterSecureStorage _storage = FlutterSecureStorage();
  static const _key = 'jwt';

  static Future<void> save(String token) async {
    _storage.write(key: _key, value: token);
  }
  static Future<String?> read() async {
    return _storage.read(key: _key);
  }
  static Future<void> delete() async {
    _storage.delete(key: _key);
  }
}

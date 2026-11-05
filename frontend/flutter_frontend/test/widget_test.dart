import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_frontend/register_route.dart';

void main() {
  testWidgets('registration form shows fields and validates empty submit', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const RegisterApp());

    expect(find.text('Create your account'), findsOneWidget);
    expect(find.text('Username'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);
    expect(find.text('Confirm password'), findsOneWidget);

    final submitButton = find.text('Create account');
    await tester.ensureVisible(submitButton);
    await tester.tap(submitButton);
    await tester.pump();

    expect(find.text('Enter a username'), findsOneWidget);
    expect(find.text('Use at least 6 characters'), findsOneWidget);
  });
}

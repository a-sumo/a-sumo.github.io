import 'package:flutterapp/src/pages/home_page.dart';
import 'package:flutter/material.dart';
//import 'package:wakelock/wakelock.dart';

void main() {
  runApp(MyApp());
  //Wakelock.enable();
}

class MyApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: MyHomePage(),
    );
  }
}
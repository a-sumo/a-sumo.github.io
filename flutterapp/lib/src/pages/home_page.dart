import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutterapp/src/pages/broadcast_page.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutterapp/src/utils/appId.dart';

class MyHomePage extends StatefulWidget {
  String channelName = "chat";

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  //String baseUrl = 'https://troisieme-oeil.herokuapp.com'; //Add the link to your deployed server here
  String baseUrl = 'https://jbagoratoken.herokuapp.com';
  //String baseUrl = 'https://thirdeyejb.herokuapp.com'; // remplacer node par jb
  //String baseUrl = 'https://retestthirdeye.herokuapp.com';
  int uid = 0;
//$tring token = "";

  Future<void> getToken() async {
    //Headers("Access-Control-Allow-Origin");
    final response = await http.get(
      Uri.parse(baseUrl +
              '/rtc/' +
              widget.channelName +
              '/publisher/uid/' +
              uid.toString()
          // To add expiry time uncomment the below given line with the time in seconds
          //+ '?expiry=450'
          ),
      headers: {"Access-Control-Allow-Origin": "*"},
    );

    if (response.statusCode == 200) {
      setState(() {
        token = response.body;
        token = jsonDecode(token)['rtcToken'];
      });
    } else {
      print('Failed to fetch the token');
    }
  }

  final _channelName = TextEditingController();
  String check = '';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        resizeToAvoidBottomInset: true,
        body: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Colors.orange, Colors.white10]),
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Text(
                  "Troisième Oeil",
                  style: TextStyle(
                      fontSize: 40,
                      fontWeight: FontWeight.bold,
                      color: Colors.deepOrange),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.remove_red_eye,
                      color: Colors.deepOrange,
                      size: 25,
                    ),
                    Icon(
                      Icons.remove_red_eye,
                      color: Colors.deepOrange,
                      size: 50,
                    ),
                    Icon(
                      Icons.remove_red_eye,
                      color: Colors.deepOrange,
                      size: 25,
                    ),
                  ],
                ),
                SizedBox(
                  height: 15,
                ),
                Container(
                  child: Image.asset(
                    "assets/arcelor-mittal.png",
                  ),
                  height: 150,
                  width: 150,
                  decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      color: Colors.white),
                ),
                SizedBox(
                  height: 25,
                ),
                Container(
                  width: MediaQuery.of(context).size.width * 0.85,
                  height: MediaQuery.of(context).size.height * 0.2,
                  child: TextFormField(
                    controller: _channelName,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide: BorderSide(color: Colors.grey),
                      ),
                      hintText: 'Nom du Channel',
                    ),
                  ),
                ),
                TextButton(
                  onPressed: () => onJoin(isBroadcaster: false),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: <Widget>[
                      Text(
                        'Regarder la Diffusion  ',
                        style: TextStyle(fontSize: 20),
                      ),
                      Icon(
                        Icons.remove_red_eye,
                      )
                    ],
                  ),
                ),
                TextButton(
                  style: TextButton.styleFrom(
                    primary: Colors.pink,
                  ),
                  onPressed: () => onJoin(isBroadcaster: true),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: <Widget>[
                      Text(
                        'Commencer à Diffuser  ',
                        style: TextStyle(fontSize: 20),
                      ),
                      Icon(Icons.live_tv)
                    ],
                  ),
                ),
                ElevatedButton(
                    onPressed: getToken,
                    child: Text(
                      "New Token !",
                      style: TextStyle(fontSize: 30),
                    )),
                Text(
                  token,
                  style: TextStyle(fontSize: 10),
                ),
                Text(
                  check,
                  style: TextStyle(color: Colors.red),
                )
              ],
            ),
          ),
        ));
  }

  Future<void> onJoin({required bool isBroadcaster}) async {
    //await [Permission.camera, Permission.microphone].request();

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => BroadcastPage(
          channelName: _channelName.text,
          isBroadcaster: isBroadcaster,
        ),
      ),
    );
  }
}

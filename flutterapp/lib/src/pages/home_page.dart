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
  //String baseUrl = 'https://jbagoratoken.herokuapp.com'; bonne version
  //String baseUrl = 'https://thirdeyejb.herokuapp.com'; // remplacer node par jb
  String baseUrl = 'https://thirdeyearcelor.herokuapp.com';
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
        visu = true;
        loadingToken = false;
      });
    } else {
      print('Failed to fetch the token');
    }
  }

  void loadToken() {
    setState(() {
      loadingToken = true;
    });
    getToken();
  }

  final _channelName = TextEditingController();
  String check = '';

  bool visu = false;
  bool loadingToken = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        resizeToAvoidBottomInset: true,
        body: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color.fromARGB(143, 250, 45, 55),
                  Color.fromARGB(146, 33, 195, 240)
                ]),
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
                      color: Colors.black),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.remove_red_eye,
                      color: Colors.black,
                      size: 25,
                    ),
                    Icon(
                      Icons.remove_red_eye,
                      color: Colors.black,
                      size: 50,
                    ),
                    Icon(
                      Icons.remove_red_eye,
                      color: Colors.black,
                      size: 25,
                    ),
                  ],
                ),
                SizedBox(
                  height: 15,
                ),
                /*Container(
                  child: Image.asset(
                    "assets/arcelor-mittal.png",
                  ),
                  height: 100,
                  width: 100,
                  decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      color: Colors.white),
                ),*/
                SizedBox(
                  height: 25,
                ),
                Container(
                  width: MediaQuery.of(context).size.width * 0.85,
                  height: MediaQuery.of(context).size.height * 0.14,
                  child: TextFormField(
                    controller: _channelName,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide:
                            BorderSide(color: Color.fromARGB(255, 60, 60, 60)),
                      ),
                      hintText: 'Nom du Channel',
                    ),
                  ),
                ),
                ElevatedButton(
                  onPressed: loadToken,
                  child: Text(
                    "New Token !",
                    style: TextStyle(fontSize: 30),
                  ),
                  style: ElevatedButton.styleFrom(
                      primary: Color.fromARGB(255, 50, 107, 153)),
                ),
                SizedBox(
                  height: 50,
                ),
                loadingToken
                    ? CircularProgressIndicator(
                        backgroundColor: Colors.grey,
                        color: Color.fromARGB(255, 94, 183, 255),
                        strokeWidth: 5,
                      )
                    : SizedBox(),
                SizedBox(
                  height: 20,
                ),
                ElevatedButton(
                  onPressed: visu
                      ? () {
                          onJoin(isBroadcaster: false);
                        }
                      : null,
                  child: Icon(
                    Icons.remove_red_eye,
                    size: 80,
                  ),
                  style: ElevatedButton.styleFrom(
                      fixedSize: Size(200, 200),
                      shape: CircleBorder(),
                      primary: Color.fromARGB(255, 18, 173, 204)),
                ),
                /* Row(
                  children: [
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
                  ],
                ),*/
                SizedBox(
                  height: 30,
                ),
                /*Text(
                  token,
                  style: TextStyle(fontSize: 10),
                ),
                Text(
                  check,
                  style: TextStyle(color: Colors.red),
                ),*/

                visu
                    ? Text(
                        "Token généré ! Vous pouvez désormais vous connecter ",
                        style: TextStyle(fontSize: 20),
                      )
                    : SizedBox()
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

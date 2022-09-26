import 'dart:convert';
import 'package:flutter/cupertino.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:TOPAZ/src/pages/broadcast_page.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:TOPAZ/src/utils/appId.dart';
import 'package:TOPAZ/src/utils/ProductDataModel.dart';
import 'package:TOPAZ/src/utils/item_card.dart';
import 'package:TOPAZ/src/utils/globals.dart' as globals;

import 'package:flutter/foundation.dart';

class MyHomePage extends StatefulWidget {
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

  String channelName = "chat";

  Future<void> getToken() async {
    //Headers("Access-Control-Allow-Origin");
    final response = await http.get(
      Uri.parse(
          baseUrl + '/rtc/' + channelName + '/publisher/uid/' + uid.toString()
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
        quelChannel();
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

  late String _channelName = "chat";
  String check = '';

  bool visu = false;
  bool loadingToken = false;
  String channelActif = "";
  Color bgcolor1 = Color.fromARGB(143, 250, 45, 55);
  Color bgcolor2 = Color.fromARGB(146, 33, 195, 240);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        resizeToAvoidBottomInset: true,
        body: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [bgcolor1, bgcolor2]),
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Text(
                  "Troisième Oeil",
                  style: TextStyle(
                      fontSize: 48,
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: ElevatedButton(
                        onPressed: _channel1,
                        style: ElevatedButton.styleFrom(
                            fixedSize: Size(140, 60),
                            primary: Color.fromARGB(255, 118, 31, 37)),
                        child: Text("Oeil Rouge"),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: ElevatedButton(
                        onPressed: _channel2,
                        style: ElevatedButton.styleFrom(
                            fixedSize: Size(140, 60),
                            primary: Color.fromARGB(255, 25, 101, 53)),
                        child: Text("Oeil Vert"),
                      ),
                    ),
                  ],
                ),
                SizedBox(
                  height: 25,
                ),
                /*ElevatedButton(
                  onPressed: loadToken,
                  child: Text(
                    "Se connecter",
                    style: TextStyle(fontSize: 24),
                  ),
                  style: ElevatedButton.styleFrom(
                      fixedSize: Size(200, 80),
                      primary: Color.fromARGB(255, 50, 107, 153)),
                ),
                SizedBox(
                  height: 30,
                ),*/
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Column(
                      children: [
                        ElevatedButton(
                          onPressed: visu
                              ? () {
                                  //onJoin(isBroadcaster: false);
                                  _casUsage();
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
                        SizedBox(
                          height: 14,
                        ),
                        Text("Visionner le Stream",
                            style: visu
                                ? TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 20,
                                  )
                                : TextStyle(fontWeight: FontWeight.normal)),
                      ],
                    ),
                    SizedBox(
                      width: 80,
                    ),
                    Column(
                      children: [
                        ElevatedButton(
                          onPressed: visu
                              ? () {
                                  onJoin(isBroadcaster: true);
                                }
                              : null,
                          child: Icon(
                            Icons.live_tv,
                            size: 80,
                          ),
                          style: ElevatedButton.styleFrom(
                              fixedSize: Size(200, 200),
                              shape: CircleBorder(),
                              primary: Color.fromARGB(255, 18, 173, 204)),
                        ),
                        SizedBox(
                          height: 14,
                        ),
                        Text("Commencer à Streamer",
                            style: visu
                                ? TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 20,
                                  )
                                : TextStyle(fontWeight: FontWeight.normal)),
                      ],
                    ),
                  ],
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
                    ? Center(
                        child: Text(
                          " Vous pouvez désormais accéder au Stream ! Oeil actuel : " +
                              channelName,
                          style: TextStyle(fontSize: 18),
                        ),
                      )
                    : SizedBox()
              ],
            ),
          ),
        ));
  }

  void _channel1() {
    setState(() {
      _channelName = "chat";
      channelName = "chat";
    });
    loadToken();
  }

  void _channel2() {
    setState(() {
      _channelName = "test";
      channelName = "test";
    });
    loadToken();
  }

  void quelChannel() {
    setState(() {
      channelActif = channelName;
    });
    if (channelActif == "chat") {
      setState(() {
        bgcolor1 = Color.fromARGB(239, 221, 36, 8);
        bgcolor2 = Color.fromARGB(43, 234, 160, 163);
      });
    }
    if (channelActif == "test") {
      setState(() {
        bgcolor1 = Color.fromARGB(223, 14, 146, 64);
        bgcolor2 = Color.fromARGB(43, 160, 234, 206);
      });
    }
  }

  Future<void> _casUsage() async {
    return showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          return CupertinoAlertDialog(
            title: Text("Quel mode de Visionnage souhaitez vous ?"),
            content: Column(
              children: [
                SizedBox(height: 10,),
                ElevatedButton(
                    onPressed: lancerAsset1, child: Text("Monter une voiture"), style: ElevatedButton.styleFrom(
                              fixedSize: Size(200, 50),
                              primary: Color.fromARGB(255, 18, 173, 204)),),
                SizedBox(height: 10,),
                ElevatedButton(
                    onPressed: lancerAsset2,
                    child: Text("Lancer flutter sur pc"), style: ElevatedButton.styleFrom(
                              fixedSize: Size(200, 50),
                              primary: Color.fromARGB(255, 18, 173, 204)),),
                SizedBox(height: 10,),
                ElevatedButton(
                    onPressed: sansAsset,
                    child: Text("Uniquement visionner"), style: ElevatedButton.styleFrom(
                              fixedSize: Size(200, 50),
                              primary: Color.fromARGB(255, 12, 118, 139)),),
              ],
            ),
            actions: <Widget>[
              TextButton(
                child: Text("Annuler"),
                onPressed: () {
                  Navigator.of(context).pop();
                },
              ),
            ],
          );
        });
  }

  void lancerAsset1() {
    setState(() {
      globals.modeOn = true;
      globals.asset0 = globals.asset1;
    });
    onJoin(isBroadcaster: false);
  }

  void lancerAsset2() {
    setState(() {
      globals.modeOn = true;
      globals.asset0 = globals.asset2;
    });
    onJoin(isBroadcaster: false);
  }

  void sansAsset() {
    setState(() {
      globals.modeOn = false;
    });
    onJoin(isBroadcaster: false);
  }
  

  

  Future<List<ProductDataModel>> ReadJsonData() async {
    final jsondata = await rootBundle.loadString(globals.asset0);
    final list = json.decode(jsondata) as List<dynamic>;

    return list.map((e) => ProductDataModel.fromJson(e)).toList();
  }

  Future<void> onJoin({required bool isBroadcaster}) async {
    //await [Permission.camera, Permission.microphone].request();

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => BroadcastPage(
          channelName: _channelName,
          isBroadcaster: isBroadcaster,
        ),
      ),
    );
  }
}

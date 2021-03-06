import 'dart:convert';
import 'package:TOPAZ/src/pages/home_page.dart';
import 'package:TOPAZ/src/utils/appId.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:agora_rtc_engine/rtc_engine.dart';
import 'package:agora_rtc_engine/rtc_local_view.dart' as RtcLocalView;
import 'package:agora_rtc_engine/rtc_remote_view.dart' as RtcRemoteView;
import 'package:TOPAZ/src/utils/ProductDataModel.dart';
import 'package:TOPAZ/src/utils/item_card.dart';
import 'package:TOPAZ/src/utils/globals.dart' as globals;
import 'package:flutter/foundation.dart';

class BroadcastPage extends StatefulWidget {
  final String channelName;
  final bool isBroadcaster;

  const BroadcastPage(
      {Key? key, required this.channelName, required this.isBroadcaster})
      : super(key: key);

  @override
  _BroadcastPageState createState() => _BroadcastPageState();
}

class _BroadcastPageState extends State<BroadcastPage> {
  final urlToken =
      "https://thirdeyearcelor.herokuapp.com/rtc/channelName/role/userAccount/uid/";

  /*var _postsJson = [];

 void fetchToken() async{

  try{
    final rep = await http.get(Uri.parse(urlToken));
    final JsonData = jsonDecode(rep.body) as List;

    setState(() {
      _postsJson = JsonData;
    });

  }catch(err){}

  token = _postsJson[0];
  
    
 } */

  final _users = <int>[];
  late RtcEngine _engine;
  bool muted = true;
  late int streamId;

  @override
  void dispose() {
    // clear users
    _users.clear();
    // destroy sdk and leave channel
    _engine.destroy();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    // initialize agora sdk
    initializeAgora();
  }

  Future<void> initializeAgora() async {
    await _initAgoraRtcEngine();

    //if (widget.isBroadcaster) streamId = await _engine?.createDataStream(false, false);

    _engine.setEventHandler(RtcEngineEventHandler(
      joinChannelSuccess: (channel, uid, elapsed) {
        setState(() {
          print('onJoinChannel: $channel, uid: $uid');
        });
      },
      leaveChannel: (stats) {
        setState(() {
          print('onLeaveChannel');
          _users.clear();
        });
      },
      userJoined: (uid, elapsed) {
        setState(() {
          print('userJoined: $uid');

          _users.add(uid);
        });
      },
      userOffline: (uid, elapsed) {
        setState(() {
          print('userOffline: $uid');
          _users.remove(uid);
        });
      },
      streamMessage: (_, __, message) {
        final String info = "here is the message $message";
        print(info);
      },
      streamMessageError: (_, __, error, ___, ____) {
        final String info = "here is the error $error";
        print(info);
      },
    ));

    await _engine.joinChannel(token, widget.channelName, null, 0);
  }

  Future<void> _initAgoraRtcEngine() async {
    _engine = await RtcEngine.createWithConfig(RtcEngineConfig(appId));
    await _engine.enableVideo();

    await _engine.setChannelProfile(ChannelProfile.LiveBroadcasting);
    if (widget.isBroadcaster) {
      await _engine.setClientRole(ClientRole.Broadcaster);
    } else {
      await _engine.setClientRole(ClientRole.Audience);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color.fromARGB(143, 126, 23, 28),
                Color.fromARGB(146, 182, 110, 23)
              ]),
        ),
        child: Center(
          child: SingleChildScrollView(
            child: Stack(
              children: <Widget>[
                _broadcastView(),
                _toolbar(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _toolbar() {
    return widget.isBroadcaster
        ? Container(
            alignment: Alignment.bottomCenter,
            padding: const EdgeInsets.symmetric(vertical: 48),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                RawMaterialButton(
                  onPressed: _onToggleMute,
                  child: Icon(
                    muted ? Icons.mic_off : Icons.mic,
                    color: muted ? Colors.white : Colors.blueAccent,
                    size: 20.0,
                  ),
                  shape: CircleBorder(),
                  elevation: 2.0,
                  fillColor: muted ? Colors.blueAccent : Colors.white,
                  padding: const EdgeInsets.all(12.0),
                ), /*
                RawMaterialButton(
                  onPressed: () => _onCallEnd(context),
                  child: Icon(
                    Icons.tv_off,
                    color: Colors.white,
                    size: 35.0,
                  ),
                  shape: CircleBorder(),
                  elevation: 2.0,
                  fillColor: Colors.redAccent,
                  padding: const EdgeInsets.all(15.0),
                ),
                RawMaterialButton(
                  onPressed: _onSwitchCamera,
                  child: Icon(
                    Icons.switch_camera,
                    color: Colors.blueAccent,
                    size: 20.0,
                  ),
                  shape: CircleBorder(),
                  elevation: 2.0,
                  fillColor: Colors.white,
                  padding: const EdgeInsets.all(12.0),
                ),*/
              ],
            ),
          )
        : Container();
  }

  /// Helper function to get list of native views
  List<Widget> _getRenderViews() {
    final List<StatefulWidget> list = [];
    if (widget.isBroadcaster) {
      list.add(RtcLocalView.SurfaceView());
    }
    _users.forEach((int uid) => list.add(RtcRemoteView.SurfaceView(
          uid: uid,
          channelId: "",
        )));
    return list;
  }

  double vueHeight = 560;
  double vueWidth = 280;
  double widthinfo1 = 0;
  bool angleVue = true;

  /// Video view row wrapper
  Widget _expandedVideoView(List<Widget> views) {
    final wrappedViews = views
        .map<Widget>((view) => Expanded(child: Container(child: view)))
        .toList();
    return Container(
      height: vueHeight,
      width: vueWidth,
      child: Row(
        children: wrappedViews,
      ),
    );
  }

  List<String> testcheck = ["text1", "text2", "text3"];
  bool checkbool = false;

  void toogleCheckChange(bool? checkBoxState) {
    if (checkBoxState != null) {
      setState(() {
        checkbool = checkBoxState;
      });
    }
  }

  /// Video layout wrapper
  Widget _broadcastView() {
    final views = _getRenderViews();
    switch (views.length) {
      case 1:
        if (!angleVue) {
          // format paysage ?? 1 ??cran
          vueHeight = MediaQuery.of(context).size.height / 1.5;
          vueWidth = MediaQuery.of(context).size.width - 50;
        } else {
          // format portrait ?? 1 ??cran
          vueHeight = MediaQuery.of(context).size.height - 130;
          vueWidth = vueHeight / 2;
        }

        return Container(
            padding: EdgeInsets.all(20),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: <Widget>[
                if(globals.modeOn && !angleVue) Column(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Container(
                      width: 9000,
                      height: vueHeight/3,
                      child: FutureBuilder(
                        future: ReadJsonData(),
                        builder: (context, data) {
                          if (data.hasError) {
                            return Center(child: Text("${data.error}"));
                          } else if (data.hasData) {
                            var items = data.data as List<ProductDataModel>;
                            return ListView.builder(
                              scrollDirection: Axis.horizontal,
                                itemCount: items == null ? 0 : items.length,
                                itemBuilder: (context, index) {
                                  return ItemCard(
                                    name: (items[index].name.toString()),
                                    prix: (items[index].price.toString()),
                                    description:
                                        (items[index].description.toString()),
                                    image: (items[index].imageURL.toString()),
                                  );
                                });
                          } else {
                            return Center(
                              child: CircularProgressIndicator(),
                            );
                          }
                        },
                      ),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[
                        _expandedVideoView([views[0]]),
                      ],
                    ),
                  ],
                ) else


               globals.modeOn ? Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Container(
                      width: 400,
                      height: vueHeight,
                      child: FutureBuilder(
                        future: ReadJsonData(),
                        builder: (context, data) {
                          if (data.hasError) {
                            return Center(child: Text("${data.error}"));
                          } else if (data.hasData) {
                            var items = data.data as List<ProductDataModel>;
                            return ListView.builder(
                                itemCount: items == null ? 0 : items.length,
                                itemBuilder: (context, index) {
                                  return ItemCard(
                                    name: (items[index].name.toString()),
                                    prix: (items[index].price.toString()),
                                    description:
                                        (items[index].description.toString()),
                                    image: (items[index].imageURL.toString()),
                                  );
                                });
                          } else {
                            return Center(
                              child: CircularProgressIndicator(),
                            );
                          }
                        },
                      ),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[
                        _expandedVideoView([views[0]]),
                      ],
                    ),
                  ],
                ):Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[
                        _expandedVideoView([views[0]]),
                      ],
                    ),

                /*for(var i in testcheck)CheckboxListTile(
                  title: Text(i.toString()),
                  subtitle: const Text('Voici un texte de test !'),
                  secondary: const Icon(Icons.code),
                  activeColor: Colors.green,
                  checkColor: Colors.white,
                  value: checkbool,
                  onChanged: (bool? value) {
                    setState(() {
                      checkbool = value!;
                    });
                  },
                ),*/
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      /*Column(
                      children: [
                        for (var i in testcheck)
                          CheckboxListTile(
                            title: Text(i.toString()),
                            secondary: Icon(Icons.beach_access),
                            value: _checkbool,
                            onChanged: toogleCheckChange,
                            activeColor: Colors.green,
                            checkColor: Colors.black,
                          )
                      ],
                    ),*/
                      Text(
                        "Bienvenue dans le Projet Troisi??me Oeil ! Admirez les flux vid??os",
                        style: TextStyle(fontSize: 20),
                      ),
                      RawMaterialButton(
                        onPressed: () => _onCallEnd(context),
                        child: Icon(
                          Icons.tv_off,
                          color: Colors.white,
                          size: 35.0,
                        ),
                        shape: CircleBorder(),
                        elevation: 2.0,
                        fillColor: Colors.redAccent,
                        padding: const EdgeInsets.all(15.0),
                      ),
                      RawMaterialButton(
                        onPressed: () => _modeVue(),
                        child: Icon(
                          Icons.screen_rotation,
                          color: Colors.white,
                          size: 35.0,
                        ),
                        shape: CircleBorder(),
                        elevation: 2.0,
                        fillColor: Colors.blue,
                        padding: const EdgeInsets.all(15.0),
                      ),
                      RawMaterialButton(
                        onPressed: () => _Recap(),
                        child: Icon(
                          Icons.pages,
                          color: Colors.white,
                          size: 35.0,
                        ),
                        shape: CircleBorder(),
                        elevation: 2.0,
                        fillColor: Colors.blue,
                        padding: const EdgeInsets.all(15.0),
                      ),
                    ],
                  ),
                ),
              ],
            )); ///////////////////////////////////////     avec ou sans mode    /////////////////////////////////////////////
      case 2:
        if (!angleVue) {
          // format paysage a 2 ??crans
          vueHeight = (1 / 2) * MediaQuery.of(context).size.height - 100;
          vueWidth = (1 / 2) * MediaQuery.of(context).size.width - 50;
        } else {
          vueHeight = MediaQuery.of(context).size.height - 130;
          vueWidth = vueHeight / 2;
          //vueHeight = 560; // format portrait ?? 2 ??crans
          //vueWidth = 280;
        }
        return Container(
            padding: EdgeInsets.all(20),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: <Widget>[
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    _expandedVideoView([views[0]]),
                    _expandedVideoView([views[1]]),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "Bienvenue dans le Projet Troisi??me Oeil ! Admirez les flux vid??os",
                        style: TextStyle(fontSize: 20),
                      ),
                      RawMaterialButton(
                        onPressed: () => _onCallEnd(context),
                        child: Icon(
                          Icons.tv_off,
                          color: Colors.white,
                          size: 35.0,
                        ),
                        shape: CircleBorder(),
                        elevation: 2.0,
                        fillColor: Colors.redAccent,
                        padding: const EdgeInsets.all(15.0),
                      ),
                      RawMaterialButton(
                        onPressed: () => _modeVue(),
                        child: Icon(
                          Icons.screen_rotation,
                          color: Colors.white,
                          size: 35.0,
                        ),
                        shape: CircleBorder(),
                        elevation: 2.0,
                        fillColor: Colors.blue,
                        padding: const EdgeInsets.all(15.0),
                      ),
                    ],
                  ),
                ),
              ],
            ));
      case 3:
        return Container(
            child: Column(
          children: <Widget>[
            _expandedVideoView(views.sublist(0, 2)),
            _expandedVideoView(views.sublist(2, 3)),
          ],
        ));
      case 4:
        return Container(
            child: Column(
          children: <Widget>[
            _expandedVideoView(views.sublist(0, 2)),
            _expandedVideoView(views.sublist(2, 4)),
          ],
        ));
      default:
    }
    return Container(
      alignment: Alignment.bottomCenter,
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: Column(
        children: [
          RawMaterialButton(
            onPressed: () => _onCallEnd(context),
            child: Icon(
              Icons.tv_off,
              color: Colors.white,
              size: 35.0,
            ),
            shape: CircleBorder(),
            elevation: 2.0,
            fillColor: Colors.redAccent,
            padding: const EdgeInsets.all(15.0),
          ),
          SizedBox(
            height: 20,
          ),
          CircularProgressIndicator(
            backgroundColor: Colors.grey,
            color: Color.fromARGB(255, 94, 183, 255),
            strokeWidth: 10,
          )
        ],
      ),
    );
  }

  bool _onTestCheck() {
    return true;
  }

  Future<List<ProductDataModel>> ReadJsonData() async {
    final jsondata = await rootBundle.loadString(globals.asset0);
    final list = json.decode(jsondata) as List<dynamic>;

    return list.map((e) => ProductDataModel.fromJson(e)).toList();
  }

  void _onCallEnd(BuildContext context) {
    Navigator.pop(context);
  }

  void _modeVue() {
    if (angleVue) {
      /*
      setState(() {
        vueHeight = 600;
        vueWidth = 300;
      });*/
      setState(() {
        angleVue = false;
      });
    } else {
      /*
      setState(() {
        vueHeight = 300;
        vueWidth = 600;
      });*/
      setState(() {
        angleVue = true;
      });
    }
  }

  Future<void> _Recap() async {
    return showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          return CupertinoAlertDialog(
            title: Text("R??cap des ??tapes ??ffectu??es"),
            content: Column(
              children: [
                for (int i = 0; i < globals.listbag.length; i++)
                  Text(globals.listbag[i].toString())
              ],
            ),
            actions: <Widget>[
              TextButton(
                child: Text("Close"),
                onPressed: () {
                  Navigator.of(context).pop();
                },
              ),
            ],
          );
        });
    print(globals.listbag);
  }

  void _onToggleMute() {
    setState(() {
      muted = !muted;
    });
    _engine.muteLocalAudioStream(muted);
  }

  void _onSwitchCamera() {
    //if (streamId != null) _engine.sendStreamMessage(streamId, "");
    _engine.switchCamera();
  }
}

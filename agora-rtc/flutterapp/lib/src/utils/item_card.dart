import 'package:flutter/material.dart';
import 'globals.dart' as globals;

class ItemCard extends StatelessWidget {
  var bag = false;

  final String name;
  final String prix;
  final String description;
  final String image;

  ItemCard({
    required this.name,
    required this.prix,
    required this.description,
    required this.image,
  });

  //List<String> listebag = [];

  Color bagplus() {
    globals.listbag.add(name);
    //listebag.insert(0, name);
    return Colors.green;
  }

  Color bagmoins() {
    globals.listbag.remove(name);
    return Colors.grey;
  }

  Color checkColor = Colors.grey;
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        //CCheck();
        bag = !bag;
        (context as Element).markNeedsBuild();
      },
      child: Container(
        margin: EdgeInsets.symmetric(horizontal: 18, vertical: 10),
        width: 300,
        height: 150,
        decoration: BoxDecoration(
          color: Colors.black,
          borderRadius: BorderRadius.circular(30),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.7),
              offset: Offset(
                0.0,
                10.0,
              ),
              blurRadius: 10.0,
              spreadRadius: -4.0,
            ),
          ],
          image: DecorationImage(
            colorFilter: ColorFilter.mode(
              Colors.black.withOpacity(0.25),
              BlendMode.multiply,
            ),
            image: NetworkImage(image),
            fit: BoxFit.cover,
          ),
        ),
        child: Stack(
          children: [
            Align(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 5.0),
                child: Text(
                  name,
                  style: TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.bold,
                  ),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 2,
                  textAlign: TextAlign.center,
                ),
              ),
              alignment: Alignment.center,
            ),
            Align(
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: EdgeInsets.all(5),
                      margin: EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.4),
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.text_format,
                            color: Colors.deepOrange,
                            size: 22,
                          ),
                          SizedBox(width: 5),
                          Text(
                            description,
                            style: TextStyle(fontSize: 12, color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              alignment: Alignment.bottomLeft,
            ),
            Align(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Container(
                    padding: EdgeInsets.all(5),
                    margin: EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.4),
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.local_fire_department,
                          color: Colors.orange,
                          size: 22,
                        ),
                        SizedBox(width: 5),
                        Text(
                          prix,
                          style: TextStyle(color: Colors.white),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              alignment: Alignment.topRight,
            ),
            Align(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Container(
                    padding: EdgeInsets.all(5),
                    margin: EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: bag
                          ? Colors.green.withOpacity(0.4)
                          : Colors.grey.withOpacity(0.8),
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.check,
                          color: bag ? bagplus() : bagmoins(),
                          size: 40,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              alignment: Alignment.bottomLeft,
            )
          ],
        ),
      ),
    );
  }
}

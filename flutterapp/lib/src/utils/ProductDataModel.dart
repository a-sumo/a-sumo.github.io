class ProductDataModel {
  int? id;
  String? name;
  String? description;
  String? imageURL;
  String? price;

  ProductDataModel(
      {this.id,
      this.name,
      this.description,
      this.imageURL,
      this.price});

  ProductDataModel.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    name = json['name'];
    description = json['description'];
    imageURL = json['imageUrl'];
    price = json['price'];
  }
}

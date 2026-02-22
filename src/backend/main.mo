import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";

actor {
  include MixinStorage();

  type PublishedPdf = {
    id : Text;
    blob : Storage.ExternalBlob;
    authorName : Text;
    title : Text;
    isPublic : Bool;
    isSearchable : Bool;
    originalFileName : ?Text;
    originalAuthor : ?Text;
  };

  let publishedPdfs = Map.empty<Text, PublishedPdf>();

  public shared ({ caller }) func publish(blob : Storage.ExternalBlob, id : Text, authorName : Text, title : Text, isPublic : Bool, isSearchable : Bool, originalFileName : ?Text, originalAuthor : ?Text) : async Text {
    let publishedPdf : PublishedPdf = {
      id;
      blob;
      authorName;
      title;
      isPublic;
      isSearchable;
      originalFileName;
      originalAuthor;
    };
    publishedPdfs.add(id, publishedPdf);
    id;
  };

  public query ({ caller }) func getPublished(id : Text) : async PublishedPdf {
    switch (publishedPdfs.get(id)) {
      case (null) { Runtime.trap("Published PDF not found.") };
      case (?publishedPdf) { publishedPdf };
    };
  };

  public query ({ caller }) func getPdfList() : async [PublishedPdf] {
    publishedPdfs.values().toArray();
  };

  public query ({ caller }) func searchPublished(searchTerm : Text) : async [PublishedPdf] {
    publishedPdfs.values().toArray().filter(
      func(publishedPdf) {
        publishedPdf.isPublic and publishedPdf.isSearchable and (
          containsCaseInsensitive(publishedPdf.title, searchTerm) or containsCaseInsensitive(publishedPdf.authorName, searchTerm)
        )
      }
    );
  };

  func textSubstring(text : Text, start : Nat, length : Nat) : Text {
    let chars = text.chars().drop(start).take(length);
    Text.fromIter(chars);
  };

  func containsCaseInsensitive(text : Text, searchTerm : Text) : Bool {
    let textSize = text.size();
    let searchTermSize = searchTerm.size();

    if (searchTermSize == 0) { return true };
    if (textSize < searchTermSize) { return false };

    for ((i, _c) in text.chars().enumerate()) {
      if (i + searchTermSize > textSize) { return false };

      let substring = textSubstring(text, i, searchTermSize);

      if (substring.size() == searchTermSize) {
        if (substring.toLower() == searchTerm.toLower()) {
          return true;
        };
      };
    };
    false;
  };
};

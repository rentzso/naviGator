var showNotesForNode;
_.templateSettings = {
    interpolate: /\{\{\=(.+?)\}\}/g,
    evaluate: /\{\{(.+?)\}\}/g
};

$(function(){
  var Note = Backbone.Model.extend({

    idAttribute:  "guid",
    clear: function(){
      this.destroy();
    }
  });


  // Tag Collection
  // -------------
  var NoteList = Backbone.Collection.extend({

    model: Note,
    localStorage: new Store("evernote-backbone"),
  });

  var NoteView = Backbone.View.extend({
  	tagName: "li",

    template: _.template($('#item-template').html()),

    events: {
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON() ) );
      return this;
    },
  });
  
  var AppView = Backbone.View.extend({
  	el: $("#noteslist"),

    linksTemplate: _.template($('#list-template').html()),


    events: {
    	
    },

    initialize: function() {

      //Tags.bind('add', Tags.fetch, this);
      //this.collection.bind('reset', this.addAll, this);
      this.collection.bind('all', this.render, this);
      this.parent = $('#noteswindow');

      this.addAll();

    },
    
  	render: function() {
      if (this.collection.length) {
        this.parent.show();
      } else {
        this.parent.hide();
      }
    },

      // Add a single tag item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(note) {
      //console.log(note);
      var view = new NoteView({model: note});
      $("#noteslist").append(view.render().el);
    },

    // Add all items in the **Todos** collection at once.
    addAll: function() {
      $("#noteslist").empty();
      //console.log("this.tag", this.options);
      $("#title").text(this.options.tag.toUpperCase());
      //console.log(JSON.stringify(this.collection));
      this.collection.each(this.addOne);
    },
    
    hide: function() {
    	this.parent.hide();
    },
  });
  
  showNotesForNode = function(node) {
  	//console.log(node.tag);
  	//console.log(JSON.stringify(node.notes));
  	var note_collection = new NoteList( node.notes );
  	//console.log(JSON.stringify(note_collection));
  	var App = new AppView({collection: note_collection, "tag": node.tag});
  	return App;
  }
  
  //startMaster(showNotesForNode);
  
  /*d3.json("foci.json", function(json){
  		  filternodes = json.nodes.filter(function(n){ return n["focus"] });
    	  //console.log( filternodes[0] );
    	  showNotesForNode( filternodes[0]);
    	});*/
  
});

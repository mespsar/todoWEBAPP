const express = require("express")
const bodyParser = require("body-parser")
const app =express()
const mongoose=require("mongoose")
const day=require(__dirname+"/date.js")
const _=require("lodash")

app.use(bodyParser.urlencoded({extended :  true}));
var toDo= [];
var workToDo=[];
app.set("view engine","ejs")
app.use(express.static("public"))
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true})
const itemSchema= {
  name:String
}
const Item= mongoose.model("item",itemSchema)
const buy= new Item({
  name:"Welcome to your TODO list"
})
const cook= new Item ({
  name:"click + to add new items"
})
const eat=new Item (
  {name:"<--- click here to delete item"}
)
var defaultItems=[buy,eat,cook]

const listSchema={
  name:String,
  items:[itemSchema]
}
const List = mongoose.model("list",listSchema)

const date= day.getDate()
app.get("/",function(req,res)

{

  Item.find(function(err,items)
  {
    if(err)
    {console.log(err)}
    else{
      if(items.length==0)
        {Item.insertMany(defaultItems,function(err)
      {
        if(err)
        {
          console.log(err)

        }
        else{
          console.log("successfully inserted")
        }
      })
    res.redirect("/")}
    console.log(items)
      res.render("list",{title:"Today" , toDo:items});
    }
  })







})


app.get("/:param",function(req,res)
{
  const customListName=_.capitalize(req.params.param)
  List.findOne({name:customListName},function(err,obj){
if(!err){
  if(!obj){
 const newList = new List({
   name:customListName,
   items:defaultItems
 })

 newList.save()
 res.redirect("/"+customListName)
}
else{console.log("exists")
res.render("list", {
  title: customListName,
  toDo: obj.items
});
}
}   // res.render("custom",{title:"work" , toDo:workToDo});
})
})
















app.get("/about" , function(req,res)
{
  res.render("about");
})

app.post("/",function(req,res){
  var newItem=req.body.newToDo;
  var listName=req.body.list
  console.log(listName)
  const add= new Item(
    {name:newItem}
  )

  if(listName==="Today"){
    add.save()
    res.redirect("/")

  }
else{
  List.findOne({name:listName},function(err,obj)
  {
    console.log(obj)
      obj.items.push(add)
      obj.save()
      res.redirect("/"+listName)
}
)
}
   // if(req.body.button =="work")
   // {
   //   workToDo.push(item);
   //   res.redirect("/work")
   // }
   // else{
   //   toDo.push(item);
   //
   //  res.redirect("/")
   // }
})
app.post("/delete",function(req,res)
{
  var delItem=req.body.checkbox
  const listName =req.body.listName
  console.log(delItem)
  if(listName=="Today"){

    Item.deleteMany({_id:delItem},function(err)
    {
      if(err)
       {
         console.log(err)}
         else{
           console.log("deleted")
           res.redirect("/")
         }
    })

  }
  else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:delItem}}},function(err,obj){
      if(!err)
      {
        res.redirect("/"+listName)
      }
    })
  }

})
app.listen(3000,function()
{
  console.log("server started ")
})

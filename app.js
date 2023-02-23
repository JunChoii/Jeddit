const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const app = express();
app.use(express.static("public"));
const db = require("./fake-db");
const PORT = 8000;

app.use(
  cookieSession({
    name: "session",
    keys: ["123123"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);
// view engine setup
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.get("/debug", (req, res) => {
  // See if you can figure out what this route is for.
  // Are you clever enough to benefit from it?
  // Did you even read this comment?
  db.debug();
  res.redirect("/");
});
///////////////////////auth////////////////////
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const user = db.getUserByUsername(username);
  if (user) {
    if (user.password === password) {
      req.session.user = user;
      res.redirect("/");
    }
  }
  res.redirect("/login");
});

app.get("/logout", (req, res) => {
  req.session.user = null;
  res.redirect("/login");
});
///////////////////////auth////////////////////

app.get("/", (req, res) => {
  // DONE
  // shows a listing of the most recent 20 posts
  // each entry has a link, which uses the title for its visible text
  // each entry also spells out its link in small print
  // each entry also lists the user that created it
  const posts = db.getPosts();
  const decoratePost = posts.map((post) => ({
    ...post,
    creator: db.getUser(post.creator),
  }));
  res.render("home", { posts: decoratePost, user: req.session.user });
});

app.get("/subs/list", (req, res) => {
  // DONE
  // shows a list of all existing subs that have at least one post
  // each entry is a link to the appropriate GET /subs/show/:subname
  // sort them predictably somehow, either alphabetical or by-post-count or something, up to you
  const posts = db.getSubs();
  res.render("subsList", { posts: posts });
});

app.get("/subs/show/:subname", (req, res) => {
  // DONE
  // `same as GET /, but filtered to only show posts that match the subname`
  const subGroupPost = db
    .getPosts()
    .find((post) => req.params.subname === post.subgroup);
  res.render("subsShow", { subGroupPost: subGroupPost });
});

app.get("/posts/show/:postid", (req, res) => {
  // DONE
  // shows post title, post link, timestamp, and creator
  // also has a list of all comments related to this post
  // each of these should show the comment description, creator, and timestamp
  // optionally, each comment could have a link to delete it
  // if you're logged in, a form for commenting should show
  // const postInfo = db.getPosts().find((post)=>req.params.id === post.id)
  // console.log(postInfo);
  const post = db.getPost(req.params.postid);
  res.render("postShow", { post });
});

app.get("/posts/create", (req, res) => {
  // DONE
  // `form for creating a new post`
  res.render("postsCreate");
});

app.post("/posts/create", (req, res) => {
  // DONE
  // processes the creation
  // doesn't allow obviously-silly creations, for example if there's no link and also no description
  // (no-link is okay if you want to do that, though)
  // every post must have a "sub", but it can be any string, including any string not previously used
  // so if the sub already exists, connect this post to that sub
  // but if the sub doesn't already exist, make a new sub!
  // when finished redirects to the post just created
  const { title, subgroup, creator, description } = req.body;
  db.addPost(title, "", creator, description, subgroup);
  res.redirect("/");
  // main page is broken somewhere dealing with uname. It doesn't send enough keys from postsCreate.ejs to the main page when it is trying to redirect the users. GET IT WORKED JUN!!!!!!!!!!!!!
});

app.get("/posts/edit/:postid", (req, res) => {
  // DONE
  // `form for editing an existing post
  // please think for a moment about which parts of a post should be editable, and which should not
  // obviously shouldn't load unless you're logged in as the correct user`
  const post = db.getPost(req.params.postid);
  res.render("edit", { post });
});

app.post("/posts/edit/:postid", (req, res) => {
  // DONE
  db.editPost(req.params.postid, req.body);
  res.redirect(`/posts/show/${req.params.postid}`);
});

app.get("/posts/deleteconfirm/:postid", (req, res) => {
  res.render("delete", { postid: req.params.postid });
  // DONE
  //form for confirming delete of an existing post
  // obviously shouldn't load unless you're logged in as the correct user
});

app.post("/posts/delete/:postid", (req, res) => {
  // DONE
  db.deletePost(req.params.postid);
  res.redirect("/");
});

app.post("/posts/comment-create/:postid", (req, res) => {
  res.send(
    `remember how GET /posts/show/:postid has a form for comments? yeah, it submits to here. comments - these routes are all optional at the PASS level, but I personally would find it useful to make them`
  );
});

app.get("/comments/show/:commentid", (req, res) => {
  res.send(
    `shows just a single comment with all its data and any links that are useful`
  );
});

app.get("/comments/deleteconfirm/:commentid", (req, res) => {
  res.send(
    `could be triggered from GET /posts/show/:postid or from GET /comments/show/:commentid`
  );
});

app.post("/comments/delete/:commentid", (req, res) => {
  res.send(`obvious, right?`);
});

app.listen(PORT, () =>
  console.log(`server should be running at http://localhost:${PORT}/`)
);

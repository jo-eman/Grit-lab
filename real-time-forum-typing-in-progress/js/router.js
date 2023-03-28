const routes = [
  { path: "/", component: Home },
  { path: "/register", component: Register },
  { path: "/login", component: Login },
  { path: "/create-post", component: CreatePost },
];

const router = async () => {
  const content = document.getElementById("content");
  const url = window.location.hash.slice(1);

  const route = routes.find((route) => route.path === url);

  if (route) {
    content.innerHTML = await route.component.render();
    await route.component.afterRender();
  } else {
    content.innerHTML = await Error404.render();
  }
};

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);

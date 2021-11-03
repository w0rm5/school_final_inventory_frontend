import Vue from "vue";
import Router from "vue-router";
import layout from "@/layout";
import store from "@/store";
import { getUserInfo } from "@/api/user";

Vue.use(Router);

const TemplateRoutes = [
  // {
  //   path: "/",
  //   component: layout,
  //   children: [
  //     {
  //       path: "",
  //       name: "dashboard",
  //       component: () => import("@/pages/dashboard")
  //     }
  //   ]
  // },
  {
    path: "/basic-ui",
    component: layout,
    children: [
      {
        path: "buttons",
        name: "buttons",
        component: () => import("@/pages/basic-ui/buttons")
      },
      {
        path: "dropdowns",
        name: "dropdowns",
        component: () => import("@/pages/basic-ui/dropdowns")
      },
      {
        path: "typography",
        name: "typography",
        component: () => import("@/pages/basic-ui/typography")
      }
    ]
  },
  {
    path: "/charts",
    component: layout,
    children: [
      {
        path: "chartjs",
        name: "chartjs",
        component: () => import("@/pages/charts/chartjs")
      }
    ]
  },
  {
    path: "/tables",
    component: layout,
    children: [
      {
        path: "basic-tables",
        name: "basic-tables",
        component: () => import("@/pages/tables/basic-tables")
      }
    ]
  },
  {
    path: "/auth-pages",
    component: {
      render(c) {
        return c("router-view");
      }
    },
    children: [
      {
        path: "login",
        name: "login_default",
        component: () => import("@/pages/samples/auth-pages/login")
      },
      {
        path: "register",
        name: "register",
        component: () => import("@/pages/samples/auth-pages/register")
      }
    ]
  },
  {
    path: "/error-pages",
    component: {
      render(c) {
        return c("router-view");
      }
    },
    children: [
      {
        path: "error-404",
        name: "error-404",
        component: () => import("@/pages/samples/error-pages/error-404")
      },
      {
        path: "error-500",
        name: "error-500",
        component: () => import("@/pages/samples/error-pages/error-500")
      }
    ]
  },
  {
    path: "/icons",
    component: layout,
    children: [
      {
        path: "mdi-icons",
        name: "mdi-icons",
        component: () => import("@/pages/icons/mdi-icons")
      }
    ]
  },
  {
    path: "*",
    redirect: "/error-404",
    component: {
      render(c) {
        return c("router-view");
      }
    },
    children: [
      {
        path: "error-404",
        component: () => import("@/pages/samples/error-pages/error-404")
      }
    ]
  }
];

export const RoutesList = [
  {
    path: "/product",
    component: layout,
    meta: { collapseId: "product", mdi: "mdi mdi-codepen", text: "Products", requiredAdmin: true },
    children: [
      {
        path: "categories",
        name: "categoryList",
        component: () => import("@/views/product/categoryList"),
        meta: { text: "Categories", requiredAdmin: true }
      },
      {
        path: "list",
        name: "productList",
        props: true,
        component: () => import("@/views/product/list"),
        meta: { text: "Product List", requiredAdmin: true }
      },
      {
        path: "edit/:id",
        name: "productEdit",
        component: () => import("@/views/product/edit"),
        meta: { text: "Product Edit", hidden: true, requiredAdmin: true }
      },
    ]
  },
  {
    path: "/report",
    component: layout,
    meta: { collapseId: "report", mdi: "mdi mdi-file-chart", text: "Reports", requiredAdmin: true },
    children: [
      {
        path: "stock-in",
        name: "stockIn",
        component: () => import("@/views/reports/stockIn"),
        meta: { text: "Stock In", requiredAdmin: true }
      },
      {
        path: "stock-in/new",
        name: "addStockIn",
        component: () => import("@/views/reports/addStockIn"),
        meta: { text: "New Stock In", hidden: true, requiredAdmin: true }
      },
    ]
  },
  {
    path: "/user",
    component: layout,
    meta: { collapseId: "user", mdi: "mdi mdi-account-multiple", text: "Users", requiredAdmin: true },
    children: [
      {
        path: "list",
        name: "userList",
        component: () => import("@/views/user/list"),
        meta: { text: "User List", requiredAdmin: true }
      },
      {
        path: "edit/:id",
        name: "userEdit",
        component: () => import("@/views/user/edit"),
        meta: { text: "User Edit", hidden: true, requiredAdmin: true }
      },
    ]
  },
]

const DefaultRoutes = [
  {
    path: "/",
    component: layout,
    children: [
      {
        path: "",
        name: "home",
        component: () => import("@/views/home")
      }
    ]
  },
  ...RoutesList,
  {
    path: "/login",
    component: {
      render(c) {
        return c("router-view");
      }
    },
    children: [
      {
        path: "/",
        name: "login",
        props: true,
        component: () => import("@/views/login")
      }
    ]
  },
  {
    path: "*",
    redirect: "/error",
    component: {
      render(c) {
        return c("router-view");
      }
    },
    children: [
      {
        path: "error",
        component: () => import("@/views/error-404")
      }
    ]
  }
];

const router = new Router({
  linkExactActiveClass: "active",
  scrollBehavior: () => ({ y: 0 }),
  mode: "history",
  base: "/",
  routes: [...TemplateRoutes, ...DefaultRoutes]
});

router.beforeEach((to, from, next) => {
  if (store.getters.token) {
    if (Object.keys(store.getters.userInfo).length === 0) {
      getUserInfo()
        .then(res => {
          store.dispatch("SetUserInfo", res.info).then(() => {
            if (to.name == "login") {
              next({ name: "home" });
            } else {
              next();
            }
          });
        })
        .catch(err => {
          store.dispatch("Logout").then(() => {
            next({
              name: "login",
              params: {
                errorMessage: err.message
              }
            });
          });
        });
    } else if (to.name == "login") {
      next({ name: "home" });
    } else {
      next();
    }
  } else if (to.name != "login") {
    next({ name: "login" });
  } else {
    next();
  }
});

export default router;

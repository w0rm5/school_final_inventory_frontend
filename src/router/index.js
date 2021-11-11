import Vue from "vue";
import Router from "vue-router";
import layout from "@/layout";
import store from "@/store";
import { getUserInfo } from "@/api/user";

Vue.use(Router);

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
      }
    ]
  },
  {
    path: "/operation",
    component: layout,
    meta: { collapseId: "operation", mdi: "mdi mdi-file-chart", text: "Operations", requiredAdmin: true },
    children: [
      {
        path: "suppliers",
        name: "supplierList",
        component: () => import("@/views/operation/supplierList"),
        meta: { text: "Suppliers", requiredAdmin: true }
      },
      {
        path: "stock-in",
        name: "stockIn",
        component: () => import("@/views/operation/stockIn"),
        meta: { text: "Stock In", requiredAdmin: true }
      },
      {
        path: "stock-in/new",
        name: "addStockIn",
        component: () => import("@/views/operation/addStockIn"),
        meta: { text: "New Stock In", hidden: true, requiredAdmin: true }
      },
      {
        path: "stock-out",
        name: "stockOut",
        component: () => import("@/views/operation/stockOut"),
        meta: { text: "Stock Out", requiredAdmin: true }
      },
      {
        path: "stock-out/new",
        name: "addStockOut",
        component: () => import("@/views/operation/addStockOut"),
        meta: { text: "New Stock Out", hidden: true, requiredAdmin: true }
      },
    ]
  },
  {
    path: "/user",
    component: layout,
    meta: {
      collapseId: "user",
      mdi: "mdi mdi-account-multiple",
      text: "Users",
      requiredAdmin: true
    },
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
      }
    ]
  }
];

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
    path: "/op",
    component: layout,
    children: [
      {
        path: "sale",
        name: "sale",
        component: () => import("@/views/operation/sale"),
        meta: { text: "Sale" }
      }
    ]
  },
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
  routes: DefaultRoutes
});

function checkPermission(to, next) {
  if (!store.getters.userInfo.is_admin) {
    if (to.meta.requiredAdmin) {
      next("/error");
    } else if (to.name == "home" ){
      next("/op/sale");
    } else {
      next()
    }
  } else {
    next();
  }
}

router.beforeEach((to, _, next) => {
  if (store.getters.token) {
    if (Object.keys(store.getters.userInfo).length === 0) {
      getUserInfo()
        .then(res => {
          store.dispatch("SetUserInfo", res.info).then(() => {
            if (to.name == "login") {
              next({ name: "home" });
            } else {
              checkPermission(to, next);
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
    } else {
      if (to.name == "login") {
        next({ name: "home" });
      } else {
        checkPermission(to, next);
      }
    }
  } else if (to.name != "login") {
    next({ name: "login" });
  } else {
    next();
  }
});

export default router;

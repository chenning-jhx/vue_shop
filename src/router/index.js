import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () => import("../views/login/Login")
const Home = () => import("../views/home/Home")
const Welcome = () => import("../views/home/Welcome")
const User = () => import("../views/user/User")
const Roles = () => import("../views/power/Roles")
const Rights = () => import("../views/power/Rights")
const Goods = () => import("../views/goods/Goods")
const Params = () => import("../views/goods/Params")
const Categories = () => import("../views/goods/Categories")
const Orders = () => import("../views/orders/Orders")
const Reports = () => import("../views/report/Reports")
const AddGoods = () => import("../views/goods/AddGoods")

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: "/login" },
  { path: '/login', component: Login },
  {
    path: '/home', component: Home, redirect: '/welcome', children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: User },
      { path: '/roles', component: Roles },
      { path: '/rights', component: Rights },
      { path: '/goods', component: Goods },
      { path: '/params', component: Params },
      { path: '/categories', component: Categories },
      { path: '/orders', component: Orders },
      { path: '/reports', component: Reports },
      { path: '/addgoods', component: AddGoods }
    ]
  },
]

const router = new VueRouter({
  mode: 'history',
  routes
})

//为router挂载路由导航守卫
router.beforeEach((to, from, next) => {
  //判断是否进入登录页面
  if (to.path === '/login') return next();
  //不是登录页面进入，取出token
  const tokenStr = localStorage.getItem('token');
  //判断token是否有效
  if (!tokenStr) return next('/login');
  next()
})


export default router

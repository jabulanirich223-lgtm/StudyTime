// Runs learner Lua with fengari (Lua 5.3 written in JavaScript). Luau-only syntax is not supported.
// @ts-expect-error fengari has no type definitions
import { lua, lauxlib, lualib, to_luastring, to_jsstring } from 'fengari';
self.onmessage = (e: MessageEvent<string>) => {
  const out: string[] = [];
  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);
  lua.lua_pushjsfunction(L, (Ls: unknown) => {
    const n = lua.lua_gettop(Ls); const parts: string[] = [];
    for (let i = 1; i <= n; i++) parts.push(to_jsstring(lauxlib.luaL_tolstring(Ls, i)));
    lua.lua_settop(Ls, n);
    out.push(parts.join('\t'));
    return 0;
  });
  lua.lua_setglobal(L, to_luastring('print'));
  const code = lauxlib.luaL_loadstring(L, to_luastring(e.data));
  if (code !== lua.LUA_OK) { postMessage({ out: '', error: to_jsstring(lua.lua_tostring(L, -1)) }); return; }
  const r = lua.lua_pcall(L, 0, 0, 0);
  if (r !== lua.LUA_OK) postMessage({ out: out.join('\n'), error: to_jsstring(lua.lua_tostring(L, -1)) });
  else postMessage({ out: out.join('\n') });
};

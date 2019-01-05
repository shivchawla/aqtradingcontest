# export GENERATE_SOURCEMAP=false;
# npm run build &> build.out
# sed -i s:/static:/dailycontest/static:g build/index.html
cp src/extraUtils/webpack.config.prod.js node_modules/react-scripts/config/webpack.config.prod.js
export GENERATE_SOURCEMAP=false;
npm run build &> build.out
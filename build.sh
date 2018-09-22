export GENERATE_SOURCEMAP=false;
npm run build &> build.out
sed -i s:/static:/dailycontest/static:g build/index.html
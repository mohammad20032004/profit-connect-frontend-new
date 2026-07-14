import React, { useState, useMemo } from 'react'
import { Dialog, DialogTitle, DialogContent, TextField, Box, Chip, Typography, Stack, InputAdornment, IconButton } from '@mui/material'
import { SearchOutlined, CloseOutlined } from '@mui/icons-material'
import {
  SiReact, SiVuedotjs, SiAngular, SiNextdotjs, SiNodedotjs, SiExpress, SiNestjs, SiFastify, SiNuxt, SiSvelte, SiRemix, SiGatsby, SiAstro, SiDeno, SiBun, SiKoa, SiHtmx,
  SiPython, SiDjango, SiFlask, SiFastapi, SiPytorch, SiTensorflow, SiJupyter, SiNumpy, Si365Datascience,
  SiSpringboot, SiHibernate, SiKotlin, SiQuarkus, SiJunit5,
  SiDotnet, SiBlazor, SiUnity, SiMonogame,
  SiGo, SiGin,
  SiRust, SiTauri, SiActix, SiRocket, SiTokio, SiYew, SiLeptos,
  SiPhp, SiLaravel, SiSymfony, SiCodeigniter, SiCakephp, SiYii, SiWordpress, SiDrupal,
  SiRubyonrails, SiRubysinatra, SiSidekiq,
  SiSwift, SiFlutter, SiDart, SiIonic, SiReactos, SiGetx, SiAndroid, SiJetpackcompose, SiApple, SiUikit, SiApachecordova, SiCapacitor, SiNativescript,
  SiMongodb, SiPostgresql, SiMysql, SiSqlite, SiMariadb, SiRedis, SiElasticsearch, SiApachecassandra, SiFirebase, SiSnowflake, SiApachehbase,
  SiDocker, SiKubernetes, SiGooglecloud, SiTerraform, SiAnsible, SiJenkins, SiGithubactions, SiHelm, SiPrometheus, SiGrafana, SiDatadog, SiSentry, SiNewrelic, SiServerless,
  SiGit, SiGithub, SiGitlab, SiBitbucket, SiMercurial, SiPerforce, SiSourcetree, SiGitkraken,
  SiFigma, SiSketch, SiFramer, SiAbstract,
  SiGraphql, SiApollographql, SiRelay, SiPrisma, SiSequelize, SiKnexdotjs, SiDrizzle, SiTypeorm, SiMongoose,
  SiWebpack, SiVite, SiRollupdotjs, SiBabel, SiGulp, SiGrunt, SiEsbuild, SiSwc, SiRecoil, SiReactquery, SiHtml5, SiPostcss, SiCssmodules,
  SiJest, SiVitest, SiMocha, SiChai, SiCypress, SiPuppeteer, SiSelenium, SiTestinglibrary,
  SiApachekafka, SiApachespark, SiApachehadoop, SiApachehive, SiApacheflink, SiApachetomcat, SiElasticstack,
  SiNginx, SiApache, SiTraefikproxy, SiCaddy, SiGunicorn, SiEclipsejetty,
  SiStorybook, SiDocusaurus, SiPostman,
  SiGnubash, SiZsh, SiFishshell, SiLinux,
  SiTypescript, SiJavascript, SiSass, SiTailwindcss, SiBootstrap, SiMui, SiChakraui, SiStyledcomponents,
  SiRedux, SiMobx, SiPinia,
  SiThreedotjs, SiUnrealengine, SiBlender, SiSolidity, SiWebgl, SiBabylondotjs, SiAframe, SiIpfs, SiBlockchaindotcom,
  SiJira, SiTrello, SiNotion, SiAsana, SiConfluence, SiLinear,
  SiIntellijidea, SiWebstorm, SiVim, SiNeovim,
  SiElixir, SiPhoenixframework, SiHaskell, SiScala, SiClojure, SiJulia, SiErlang, SiFortran, SiCommonlisp, SiOcaml, SiZig, SiCrystal, SiCplusplus, SiC, SiOdin, SiNim, SiFsharp,
  SiEthereum, SiWeb3Dotjs, SiScikitlearn, SiGeopandas,
  SiSwagger, SiInsomnia, SiReadme, SiGitbook, SiMintlify, SiSemrush, SiOpenapiinitiative,
  SiVapor,
  SiScrumalliance, SiOpenid, SiGoogleanalytics, SiGooglesearchconsole,
  SiMicrostrategy, SiRoadmapdotsh, SiVitepress, SiMqtt, SiFresh, SiElastic, SiSocket, SiPuma, SiAmp,
  SiCss, SiRuby, SiR, SiVllm, SiSecurityscorecard, SiSolid, SiZap, SiCorsair, SiGreasyfork, SiMozilla,
  SiOpenjdk, SiSocketdotio,
  SiEslint, SiPrettier, SiStylelint, SiCommitlint, SiPrecommit, SiWebrtc,
  SiPnpm, SiYarn, SiNpm, SiLerna, SiNx, SiTurborepo,
  SiAndroidstudio, SiXcode, SiRider, SiGoland, SiPycharm, SiDatagrip, SiRubymine, SiClion, SiResharper,
  SiVagrant, SiPacker, SiNomad, SiConsul, SiVault, SiVmware, SiOctopusdeploy, SiTeamcity,
  SiJasmine, SiCoveralls, SiCodecov, SiCodacy, SiTravisci, SiCircleci,
} from 'react-icons/si'

const skillIcons = {
  React: SiReact, 'Vue.js': SiVuedotjs, Angular: SiAngular, 'Next.js': SiNextdotjs, 'Nuxt.js': SiNuxt,
  Svelte: SiSvelte, Remix: SiRemix, Gatsby: SiGatsby, Astro: SiAstro, 'Solid.js': null, htmx: SiHtmx,
  'Node.js': SiNodedotjs, Deno: SiDeno, Bun: SiBun, 'Express.js': SiExpress, NestJS: SiNestjs, Fastify: SiFastify, Koa: SiKoa,
  Python: SiPython, Django: SiDjango, Flask: SiFlask, FastAPI: SiFastapi,
  PyTorch: SiPytorch, TensorFlow: SiTensorflow, Jupyter: SiJupyter, NumPy: SiNumpy,
  'Data Science': Si365Datascience,
  'Spring Boot': SiSpringboot, Hibernate: SiHibernate, Kotlin: SiKotlin, Quarkus: SiQuarkus,
  JUnit: SiJunit5,
  '.NET Core': SiDotnet, Blazor: SiBlazor, Unity: SiUnity, MonoGame: SiMonogame,
  Go: SiGo, Gin: SiGin,
  Rust: SiRust, Tauri: SiTauri, Actix: SiActix, Rocket: SiRocket, Tokio: SiTokio, Yew: SiYew, Leptos: SiLeptos,
  PHP: SiPhp, Laravel: SiLaravel, Symfony: SiSymfony, CodeIgniter: SiCodeigniter, CakePHP: SiCakephp, Yii: SiYii, WordPress: SiWordpress, Drupal: SiDrupal,
  Rails: SiRubyonrails, Sinatra: SiRubysinatra, Sidekiq: SiSidekiq, Puma: SiPuma,
  Swift: SiSwift, UIKit: SiUikit,
  Flutter: SiFlutter, Dart: SiDart, Ionic: SiIonic, 'React Native': SiReactos, GetX: SiGetx,
  Android: SiAndroid, 'Jetpack Compose': SiJetpackcompose,
  iOS: SiApple,
  Cordova: SiApachecordova, Capacitor: SiCapacitor, NativeScript: SiNativescript,
  MongoDB: SiMongodb, PostgreSQL: SiPostgresql, MySQL: SiMysql, SQLite: SiSqlite, MariaDB: SiMariadb,
  Redis: SiRedis, Elasticsearch: SiElasticsearch, Cassandra: SiApachecassandra, Firebase: SiFirebase,
  Snowflake: SiSnowflake, HBase: SiApachehbase,
  Docker: SiDocker, GCP: SiGooglecloud, Terraform: SiTerraform, Ansible: SiAnsible, Jenkins: SiJenkins,
  'GitHub Actions': SiGithubactions, Kubernetes: SiKubernetes, Serverless: SiServerless,
  Helm: SiHelm, Prometheus: SiPrometheus, Grafana: SiGrafana, Datadog: SiDatadog, Sentry: SiSentry, 'New Relic': SiNewrelic,
  'ELK Stack': SiElasticstack,
  Git: SiGit, GitHub: SiGithub, GitLab: SiGitlab, Bitbucket: SiBitbucket,
  Mercurial: SiMercurial, Perforce: SiPerforce, SourceTree: SiSourcetree, GitKraken: SiGitkraken,
  Linux: SiLinux, Bash: SiGnubash, Zsh: SiZsh, Fish: SiFishshell,
  Figma: SiFigma, Sketch: SiSketch, Framer: SiFramer, Abstract: SiAbstract,
  GraphQL: SiGraphql, Apollo: SiApollographql, Relay: SiRelay,
  Prisma: SiPrisma, Sequelize: SiSequelize, Knex: SiKnexdotjs,
  Drizzle: SiDrizzle, TypeORM: SiTypeorm, Mongoose: SiMongoose,
  Webpack: SiWebpack, Vite: SiVite, Rollup: SiRollupdotjs, Babel: SiBabel, Gulp: SiGulp,
  Grunt: SiGrunt, ESBuild: SiEsbuild, Swc: SiSwc, Recoil: SiRecoil,
  HTML: SiHtml5, PostCSS: SiPostcss, 'CSS Modules': SiCssmodules,
  'React Query': SiReactquery,
  Jest: SiJest, Vitest: SiVitest, Mocha: SiMocha, Chai: SiChai, Cypress: SiCypress, Puppeteer: SiPuppeteer, Selenium: SiSelenium,
  'Testing Library': SiTestinglibrary,
  Kafka: SiApachekafka, Spark: SiApachespark, Hadoop: SiApachehadoop, Hive: SiApachehive,
  Flink: SiApacheflink, Tomcat: SiApachetomcat, Jetty: SiEclipsejetty,
  Nginx: SiNginx, Apache: SiApache, Traefik: SiTraefikproxy, Caddy: SiCaddy, 'Gunicorn': SiGunicorn,
  Storybook: SiStorybook, Docusaurus: SiDocusaurus, Postman: SiPostman,
  TypeScript: SiTypescript, JavaScript: SiJavascript, Sass: SiSass, 'Tailwind CSS': SiTailwindcss,
  Bootstrap: SiBootstrap, 'Material UI': SiMui, 'Chakra UI': SiChakraui, 'Styled Components': SiStyledcomponents,
  Redux: SiRedux, MobX: SiMobx, Pinia: SiPinia,
  'Three.js': SiThreedotjs, 'Unreal Engine': SiUnrealengine, Blender: SiBlender,
  Solidity: SiSolidity, WebGL: SiWebgl, 'Babylon.js': SiBabylondotjs, 'A-Frame': SiAframe, IPFS: SiIpfs,
  Blockchain: SiBlockchaindotcom,
  Jira: SiJira, Trello: SiTrello, Notion: SiNotion, Asana: SiAsana, Confluence: SiConfluence, Linear: SiLinear,
  Scrum: SiScrumalliance,
  IntelliJ: SiIntellijidea, WebStorm: SiWebstorm, Vim: SiVim, Neovim: SiNeovim,
  Elixir: SiElixir, Phoenix: SiPhoenixframework, Haskell: SiHaskell, Scala: SiScala, Clojure: SiClojure, Julia: SiJulia,
  Erlang: SiErlang, Fortran: SiFortran, Lisp: SiCommonlisp, OCaml: SiOcaml, Zig: SiZig, Crystal: SiCrystal,
  'C++': SiCplusplus, C: SiC, Odin: SiOdin, Nim: SiNim, 'F#': SiFsharp,
  Ethereum: SiEthereum, Web3: SiWeb3Dotjs,
  'Scikit-learn': SiScikitlearn, Pandas: SiGeopandas,
  Swagger: SiSwagger, Insomnia: SiInsomnia, ReadMe: SiReadme, GitBook: SiGitbook, Mintlify: SiMintlify,
  SEMrush: SiSemrush, Vapor: SiVapor,
  OpenAPI: SiOpenapiinitiative,
  'Google Analytics': SiGoogleanalytics, 'Search Console': SiGooglesearchconsole,
  Strategy: SiMicrostrategy, Roadmap: SiRoadmapdotsh,
  VitePress: SiVitepress, Vitepress: SiVitepress,
  OpenID: SiOpenid,
  MQTT: SiMqtt, Fresh: SiFresh, Socket: SiSocket,
  Analytics: SiGoogleanalytics,
  CSS: SiCss, Ruby: SiRuby, R: SiR,
  LLM: SiVllm, Security: SiSecurityscorecard, SOLID: SiSolid, Zap: SiZap, CORS: SiCorsair, Fork: SiGreasyfork, Moz: SiMozilla,
  Java: SiOpenjdk,
  'Solid.js': SiSolid, SCSS: SiSass, 'CSS-in-JS': SiStyledcomponents,
  'C#': SiDotnet, 'ASP.NET': SiDotnet,
  'WebSocket': SiSocketdotio, 'WebRTC': SiWebrtc,
  ESLint: SiEslint, Prettier: SiPrettier, Stylelint: SiStylelint, Commitlint: SiCommitlint, 'Pre-commit': SiPrecommit,
  npm: SiNpm, Yarn: SiYarn, pnpm: SiPnpm, Lerna: SiLerna, Nx: SiNx, Turborepo: SiTurborepo,
  'Android Studio': SiAndroidstudio, Xcode: SiXcode, Rider: SiRider, GoLand: SiGoland,
  PyCharm: SiPycharm, DataGrip: SiDatagrip, RubyMine: SiRubymine, CLion: SiClion, ReSharper: SiResharper,
  Vagrant: SiVagrant, Packer: SiPacker, Nomad: SiNomad, Consul: SiConsul, Vault: SiVault,
  VMware: SiVmware, 'Octopus Deploy': SiOctopusdeploy, TeamCity: SiTeamcity,
  'Socket.io': SiSocketdotio, Jasmine: SiJasmine, Coveralls: SiCoveralls,
  Codecov: SiCodecov, Codacy: SiCodacy, 'Travis CI': SiTravisci, CircleCI: SiCircleci,
}

const SKILL_DB = [
  { cat: 'Frontend', skills: ['React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte', 'Solid.js', 'Remix', 'Gatsby', 'Astro', 'HTML', 'CSS', 'SCSS', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'Chakra UI', 'Styled Components', 'Sass', 'PostCSS', 'CSS Modules', 'CSS-in-JS', 'Emotion'] },
  { cat: 'JavaScript', skills: ['JavaScript', 'TypeScript', 'React Query', 'Zustand', 'Redux', 'MobX', 'Recoil', 'Jotai', 'Valtio', 'Webpack', 'Vite', 'Rollup', 'Parcel', 'ESBuild', 'Swc', 'Turbopack', 'Babel', 'Gulp', 'Grunt', 'ESLint', 'Prettier', 'npm', 'Yarn', 'pnpm', 'Lerna', 'Nx', 'Turborepo'] },
  { cat: 'Backend', skills: ['Node.js', 'Deno', 'Bun', 'Express.js', 'NestJS', 'Fastify', 'Koa', 'Hapi', 'GraphQL', 'Apollo', 'Relay', 'REST API', 'gRPC', 'WebSocket', 'Socket.io', 'SSE', 'MQTT'] },
  { cat: 'Python', skills: ['Python', 'Django', 'Flask', 'FastAPI', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'Pandas', 'NumPy', 'Jupyter'] },
  { cat: 'Java', skills: ['Java', 'Spring Boot', 'Spring Cloud', 'Hibernate', 'Kotlin', 'Grails', 'Quarkus', 'Micronaut', 'Jakarta EE', 'JUnit'] },
  { cat: '.NET', skills: ['C#', '.NET Core', 'ASP.NET', 'Blazor', 'Xamarin', 'MAUI', 'Unity', 'MonoGame', 'SignalR', 'Entity Framework'] },
  { cat: 'Go', skills: ['Go', 'Gin', 'Echo', 'Fiber', 'Chi', 'Cobra', 'Viper', 'Zap', 'GORM', 'Buffalo'] },
  { cat: 'Rust', skills: ['Rust', 'Actix', 'Rocket', 'Axum', 'Tokio', 'Serde', 'Clap', 'Tauri', 'Yew', 'Leptos'] },
  { cat: 'PHP', skills: ['PHP', 'Laravel', 'Symfony', 'CodeIgniter', 'CakePHP', 'Yii', 'Phalcon', 'Slim', 'WordPress', 'Drupal'] },
  { cat: 'Ruby', skills: ['Ruby', 'Rails', 'Sinatra', 'Rack', 'Hanami', 'Grape', 'Padrino', 'RSpec', 'Puma', 'Sidekiq'] },
  { cat: 'Mobile', skills: ['Swift', 'SwiftUI', 'UIKit', 'Combine', 'Alamofire', 'Realm', 'CoreData', 'XCTest', 'Vapor', 'RxSwift', 'Dart', 'Flutter', 'Riverpod', 'Bloc', 'GetX', 'Provider', 'Hive', 'Dio', 'Freezed', 'Drift', 'Kotlin Multiplatform', 'Jetpack Compose', 'Android SDK', 'RxJava', 'Dagger', 'Retrofit', 'Room', 'Moshi', 'Coil', 'Coroutines', 'Mobile Development', 'iOS', 'Android', 'Cross-platform', 'React Native', 'Ionic', 'Cordova', 'Capacitor', 'PhoneGap', 'NativeScript'] },
  { cat: 'Database', skills: ['MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'MariaDB', 'Redis', 'Elasticsearch', 'Cassandra', 'DynamoDB', 'Firestore', 'Prisma', 'TypeORM', 'Mongoose', 'Sequelize', 'Knex', 'Drizzle', 'MicroORM'] },
  { cat: 'DevOps', skills: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform', 'Ansible', 'Helm', 'Jenkins', 'GitHub Actions', 'CI/CD', 'DevOps', 'SRE', 'Monitoring', 'Prometheus', 'Grafana', 'Datadog', 'New Relic', 'Sentry', 'ELK Stack', 'Vagrant', 'Packer', 'Nomad', 'Consul', 'Vault', 'VMware', 'Octopus Deploy', 'TeamCity'] },
  { cat: 'Design', skills: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'InDesign', 'After Effects', 'Premiere Pro', 'Lightroom', 'Sketch', 'InVision', 'UI Design', 'UX Design', 'Wireframing', 'Prototyping', 'User Research', 'Usability Testing', 'Design Systems', 'Framer', 'Zeplin', 'Abstract'] },
  { cat: 'Tools', skills: ['Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN', 'Mercurial', 'Perforce', 'SourceTree', 'Fork', 'GitKraken', 'Linux', 'Bash', 'PowerShell', 'Zsh', 'Fish', 'Vim', 'Neovim', 'VS Code', 'IntelliJ', 'WebStorm', 'Android Studio', 'Xcode', 'Rider', 'GoLand', 'PyCharm', 'DataGrip', 'RubyMine', 'CLion', 'ReSharper', 'Nginx', 'Apache', 'Traefik', 'Caddy', 'HAProxy', 'IIS', 'Tomcat', 'Jetty', 'Undertow', 'Gunicorn', 'Stylelint', 'Commitlint', 'Pre-commit'] },
  { cat: 'Testing', skills: ['Jest', 'Vitest', 'Mocha', 'Chai', 'Cypress', 'Playwright', 'Puppeteer', 'Selenium', 'Testing Library', 'Karma', 'Jasmine', 'Coveralls', 'Codecov', 'Codacy', 'Travis CI', 'CircleCI'] },
  { cat: 'Data & AI', skills: ['Data Science', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'AI', 'LLM', 'RAG', 'Fine-tuning', 'Prompt Engineering', 'Big Data', 'Spark', 'Hadoop', 'Kafka', 'Flink', 'Hive', 'Pig', 'HBase', 'Snowflake', 'Redshift', 'R', 'MATLAB', 'Julia', 'Scala'] },
  { cat: 'Architecture', skills: ['Microservices', 'Serverless', 'Lambda', 'Cloud Functions', 'Fargate', 'ECS', 'EKS', 'ACR', 'ECR', 'Amplify', 'System Design', 'Architecture', 'DDD', 'TDD', 'BDD', 'Clean Architecture', 'SOLID', 'Design Patterns', 'OOP', 'Functional Programming'] },
  { cat: 'Blockchain', skills: ['Blockchain', 'Solidity', 'Web3', 'Ethereum', 'Smart Contracts', 'DeFi', 'NFT', 'IPFS', 'Hardhat', 'Truffle'] },
  { cat: 'Security', skills: ['OAuth', 'JWT', 'SAML', 'OpenID', 'SSL/TLS', 'HTTPS', 'CORS', 'CSRF', 'XSS', 'SQL Injection', 'Security', 'Penetration Testing'] },
  { cat: 'Management', skills: ['Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence', 'Notion', 'Linear', 'Trello', 'Asana', 'Monday.com', 'Slack', 'Leadership', 'Team Management', 'Mentoring', 'Code Review', 'Project Management', 'Product Management', 'Strategy', 'Roadmap', 'OKR', 'KPIs'] },
  { cat: 'Languages', skills: ['C++', 'C', 'Zig', 'Odin', 'Nim', 'Crystal', 'Haskell', 'Elixir', 'Phoenix', 'Erlang', 'COBOL', 'Fortran', 'Lisp', 'Clojure', 'F#', 'OCaml'] },
  { cat: 'Other', skills: ['AR/VR', 'Unity 3D', 'Unreal Engine', 'WebGL', 'Three.js', 'Babylon.js', 'A-Frame', 'ARKit', 'ARCore', 'OpenXR', 'Blender', 'SEO', 'Analytics', 'A/B Testing', 'Conversion Optimization', 'Google Analytics', 'Search Console', 'SEMrush', 'Ahrefs', 'Moz', 'GTmetrix', 'Performance', 'Accessibility', 'Technical Writing', 'Documentation', 'API Documentation', 'Swagger', 'OpenAPI', 'Postman', 'Insomnia', 'Stoplight', 'ReadMe', 'GitBook', 'Communication', 'Presentation', 'Negotiation', 'Problem Solving', 'Critical Thinking', 'Creativity', 'Adaptability', 'Collaboration', 'Conflict Resolution', 'Decision Making', 'Storybook', 'Ladle', 'Styleguidist', 'Docz', 'Docusaurus', 'VitePress', 'Vitepress', 'Astro Docs', 'Mintlify', 'Slate'] },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const letterColors = ['#2D1055', '#3a008b', '#0f0024']
function SkillIcon({ name }) {
  const Icon = skillIcons[name]
  if (!Icon) {
    const c = name.charCodeAt(0) || 0
    return <Box component="span" sx={{ width: 12, height: 10, minWidth: 12, borderRadius: '4px', bgcolor: letterColors[c % letterColors.length], color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>{name[0].toUpperCase()}</Box>
  }
  return <Icon size={12} />
}

export default function SkillsModal({ open, onClose, selected, onToggle }) {
  const [search, setSearch] = useState('')

  const allSkills = useMemo(() => {
    const flat = SKILL_DB.flatMap((g) => g.skills)
    return shuffle(flat)
  }, [open])

  const filtered = search.trim()
    ? allSkills.filter((s) => s.toLowerCase().includes(search.toLowerCase()))
    : allSkills

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4, maxHeight: '80vh', overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(12,8,24,0.2)',
          animation: 'fadeUp 0.3s ease',
          '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        },
      }}
    >
      <DialogTitle sx={{ pb: 0, pt: 2.5, px: 3 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#1F0A3B', fontSize: '1.1rem' }}>
            Select Skills ({selected.length} selected)
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: '#5C5580', '&:hover': { bgcolor: 'rgba(61,28,110,0.06)' } }}>
            <CloseOutlined fontSize="small" />
          </IconButton>
        </Stack>
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search skills..."
          fullWidth
          size="small"
          autoFocus
          sx={{ mt: 2 , mb: 2}}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined sx={{ color: '#B5AECB', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 2.5, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No skills found</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
            {filtered.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                size="small"
                variant={selected.includes(skill) ? 'filled' : 'outlined'}
                color={selected.includes(skill) ? 'primary' : 'default'}
                onClick={() => onToggle(skill)}
                icon={<SkillIcon name={skill} />}
                sx={{
                  transition: 'all 0.15s ease',
                  fontWeight: selected.includes(skill) ? 600 : 400,
                  pl: 0.5,
                  '& .MuiChip-icon': { ml: 0.5, mr: -0.2, color: 'inherit' },
                  '&:hover': { transform: 'scale(1.06)', boxShadow: '0 2px 8px rgba(61,28,110,0.12)' },
                }}
              />
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

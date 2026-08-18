import React, { useState, useMemo } from 'react'
import { Dialog, DialogTitle, DialogContent, TextField, Box, Chip, Typography, Stack, InputAdornment, IconButton } from '@mui/material'
import { SearchOutlined, CloseOutlined } from '@mui/icons-material'
import SkillIcon from '../SkillIcon'

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
          borderRadius: 1, maxHeight: '80vh', overflow: 'hidden',
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
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined sx={{ color: '#B5AECB', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
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

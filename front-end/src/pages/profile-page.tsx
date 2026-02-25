import React from 'react';
import { Mail, Phone, MapPin, Calendar, Edit2, Camera, Link as LinkIcon, Github, Twitter, Linkedin } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input, Badge, Avatar, Tabs } from '../components/ui';

const userInfo = {
  name: 'Musharof',
  email: 'musharof@example.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  birthday: 'January 15, 1990',
  role: 'UX Designer',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAw1JykhpFTDU3cllq0Kc91yvGWhOF19E8xjzVydiUk4ew0xTD8b0n5YZVkWNo-QNmeUgr1yCfFPh5QM6CWV0vCzVF3dd6nNPXiVxZ7L_r_EbfJXK1J_9lSahNKs6z3T-Iwc0_5G9xYdRJYRaHTsuzzupkDI0_8kEoL_4V6CNiaTDkfQVjdo27Cp_wvnwJGTmn6UiADbXc9nO5DQhgKfFbtUF9wsF3Oxsej2lTw4IBeuIH-tYXx8dE9LmvtTasybyBivP7Eai7m7jg',
  bio: 'Passionate UX designer with 8+ years of experience creating user-centered digital experiences. I love turning complex problems into simple, beautiful solutions.',
  socialLinks: {
    github: 'https://github.com',
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com',
  },
};

const skills = [
  { name: 'UI/UX Design', level: 95 },
  { name: 'Figma', level: 90 },
  { name: 'User Research', level: 85 },
  { name: 'Prototyping', level: 88 },
  { name: 'HTML/CSS', level: 75 },
  { name: 'JavaScript', level: 60 },
];

const projects = [
  { name: 'E-commerce Redesign', status: 'completed', color: 'success' },
  { name: 'Mobile App v2', status: 'in-progress', color: 'info' },
  { name: 'Dashboard Design', status: 'completed', color: 'success' },
  { name: 'Brand Guidelines', status: 'pending', color: 'warning' },
];

const activityLog = [
  { action: 'Updated profile picture', time: '2 hours ago' },
  { action: 'Completed "Dashboard Design" project', time: '1 day ago' },
  { action: 'Added new skill "JavaScript"', time: '3 days ago' },
  { action: 'Joined team "Design System"', time: '1 week ago' },
];

export function ProfilePage() {
  const [activeTab, setActiveTab] = React.useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: 'Projects' },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <Card>
          <div className="relative h-32 bg-gradient-to-r from-[#3c50e0] to-indigo-600 rounded-t-xl">
            <button className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          <CardContent className="relative pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
              <div className="relative">
                <Avatar src={userInfo.avatar} name={userInfo.name} size="xl" className="border-4 border-white dark:border-slate-800" />
                <button className="absolute bottom-0 right-0 p-1.5 bg-[#3c50e0] rounded-full text-white hover:bg-blue-700 transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{userInfo.name}</h1>
                <p className="text-slate-500 dark:text-slate-400">{userInfo.role}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="primary">Follow</Button>
                <Button variant="outline">Message</Button>
              </div>
            </div>
            <p className="mt-4 text-slate-600 dark:text-slate-300 text-center sm:text-left">{userInfo.bio}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                {userInfo.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                {userInfo.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {userInfo.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {userInfo.birthday}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Skills</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700 dark:text-slate-200">{skill.name}</span>
                      <span className="text-slate-500 dark:text-slate-400">{skill.level}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-[#3c50e0] rounded-full" style={{ width: `${skill.level}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Social Links</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                <a href={userInfo.socialLinks.github} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <Github className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  <span className="text-sm text-slate-700 dark:text-slate-200">github.com/musharof</span>
                </a>
                <a href={userInfo.socialLinks.twitter} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <Twitter className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  <span className="text-sm text-slate-700 dark:text-slate-200">@musharof</span>
                </a>
                <a href={userInfo.socialLinks.linkedin} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <Linkedin className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  <span className="text-sm text-slate-700 dark:text-slate-200">linkedin.com/in/musharof</span>
                </a>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'projects' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Projects</h2>
              <Button variant="outline" size="sm">Add Project</Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Project Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.name} className="border-b border-slate-100 dark:border-slate-700/50">
                        <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-200">{project.name}</td>
                        <td className="py-3 px-4">
                          <Badge variant={project.color as 'success' | 'info' | 'warning'}>{project.status}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Activity Log</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLog.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                    <div className="w-2 h-2 mt-2 rounded-full bg-[#3c50e0]" />
                    <div>
                      <p className="text-sm text-slate-700 dark:text-slate-200">{activity.action}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

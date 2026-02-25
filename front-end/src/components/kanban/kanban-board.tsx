import React from 'react';
import { Search, Plus, ChevronRight } from 'lucide-react';
import { KanbanColumn } from './kanban-column';
import type { Task, KanbanColumn as KanbanColumnType } from '../../types/task';

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Solve the dribble prioritization issue with the team',
    status: 'todo',
    category: 'Marketing',
    dueDate: 'Jan 08, 2027',
    assigneeAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAgNHLZCWU65J_CnhPZnN3_colt0ueWpT81gKummSMkQLwQE_rhUbqyVdMJsZKKv1AILmrJbK5nztm5bDs2BXCyNMyU6xJj4KL8vAaqWYvwIHsE95SbJAWL0Srlknm42U8XCpL4CMrW16QOdCDWWj9DA4azGwfxaDY-_G8FG_NPzTXOIHEY38KNLe4URXErnAqMHQEewFpgeadQX_SDInbdHZtU4Uhf2yNuuxK88W9RrTgNIgP9qJhts4Q3HooEYtcK4NAmY0m7jds',
    comments: 1,
  },
  {
    id: '2',
    title: 'Finish user onboarding',
    status: 'todo',
    category: 'Development',
    dueDate: 'Tomorrow',
    assigneeAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD9jhxI3lvVMOqhzrXThfTIytlaCdlWG7HTS-FVEGvceS0meCEgPUxqOAdaatk_xze0RPwg7Dt54LZCPRWUVD8eLF1kuGB6sIJ7n4esSHZWz0YdcekfAFwH9SaiX41CrvqzYXilLNYranrelu9rDNJ33R22IJIUr_ToAIRTdj7iFd7mnyfXUZWOjqYtezFkEkFtWfEkhCyrAZoSj3o49TEQKM7i37Hx9tZQArmRzjARvO-aMSsF9KeLuuCHckMS28qQfh3XMBLL9q0',
    comments: 1,
  },
  {
    id: '3',
    title: 'Change license and remove products',
    status: 'todo',
    category: 'Dev',
    dueDate: 'Jan 8, 2027',
    assigneeAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDa4O9kKBe4F5M3RLRn_Pgnmoc3cH3QKQq8r7GMGQm2IkPhNABgPTKUCrzpFeJMDTT7qs1odTmBmKnsfAr9400K1cFOt7B9_Qg7FlqTg8mUVmVDUE6l2GwPuhMKx_6tobhTV8TokZOVXoqG53CSO4OjXmk1nMJul3emCRj2vloFwwHR1Qr6EmglxyVQnoPxF8Cs-f9S729IzmlrIl-1WZj5EtXjcZAMeXdO7YcLLXiIjGjrL7no2DVYadppOY519PTUIN1U5_pYeF8',
  },
  {
    id: '4',
    title: 'Kanban manager',
    status: 'in-progress',
    category: 'Template',
    dueDate: 'Jan 08, 2027',
    assigneeAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD9jhxI3lvVMOqhzrXThfTIytlaCdlWG7HTS-FVEGvceS0meCEgPUxqOAdaatk_xze0RPwg7Dt54LZCPRWUVD8eLF1kuGB6sIJ7n4esSHZWz0YdcekfAFwH9SaiX41CrvqzYXilLNYranrelu9rDNJ33R22IJIUr_ToAIRTdj7iFd7mnyfXUZWOjqYtezFkEkFtWfEkhCyrAZoSj3o49TEQKM7i37Hx9tZQArmRzjARvO-aMSsF9KeLuuCHckMS28qQfh3XMBLL9q0',
    comments: 2,
    attachments: 8,
  },
  {
    id: '5',
    title: 'Product Update - Q4 (2024)',
    status: 'in-progress',
    category: 'Development',
    description: 'Dedicated from a category of users that will perform actions.',
    dueDate: 'Today',
    assigneeAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAMWYTpEMT7mubToMWopYudb8VmRgVZ19jrEL6lzTbdZPTpD3Qjgqb5-rqHbvfdfsnJrh4yLGMEqNbH-eA9D49ZKJJocjin_wVWNmZkcS3Z-2mA8yHJz4pan7-wRA6OcMeQFLK7m_LvBHJ9YIdC9wiUT-OF_EKo-NWRmh2LfBu0JmOQUXQLKAXTwq0YsdT6nRSo0EczzgwlauIe3GitKdFqG1EulEf6QU1HMPUwot_sLlfCCY_jeYnJbH7uxEqBPVJP1jmfGjzlVE4',
    comments: 1,
    hasImage: true,
  },
  {
    id: '6',
    title: 'Design system review',
    status: 'in-progress',
    category: 'Marketing',
    dueDate: 'Jan 08, 2027',
    assigneeAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD4f_5apDotDtXohmolOu9R0ub7C2xNVxuE_BJlRanBxcPkFEbH_zWQiyZIRvAQCsyklsHF3X6pmaMe9ZJNG8dgW5Nc0rMSd5F3ThHj-0Fa5PI35UFfXTm_8cy7qOfVO8tC6UjxeXGO97ZEICt9jIeZykeJr3dmVNSASAM9293ZTc4ouX6I8EOd1AeNa-OCcN_l6pNO1Uu5s-zre3BG8Pt4LEEabG3RhWrEeTROEsW0LUiP3JTHoPNT2r25YmuJKE-3ETqRXFeJUyY',
    comments: 2,
    attachments: 8,
  },
  {
    id: '7',
    title: 'Manage internal feedback',
    status: 'completed',
    category: 'Dev',
    dueDate: 'Tomorrow',
    assigneeAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBMOZT1-qkYYmFPVTV_0Ou3WwSW_YzZ1kiPGIn_ocvZiMFhmtwFqkxUCSBaMWRf20xDzJvXaQpYfu4r4MDEnOB7WYMX3NYrKVE7qs1OnoaoG9WXaGD1RB58tLHsNAj8QX_lb6exBL-U1SH4OGjSlppjfXF7U4MOqBFuntRPL8W4H9ziFJmisbtIINgYzllARjzVYPY7I3GUBqVgBTXPhvyt75-hNBiCrEnQ32Rm9SzO2ZlRuPYiSAEuoZzuYrrn76SViv-GN17m3Wo',
    comments: 1,
  },
  {
    id: '8',
    title: 'Do some projects on React Native with Flutter',
    status: 'completed',
    category: 'Development',
    dueDate: 'Jan 8, 2027',
    assigneeAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCn9rrLlEyCMacBIZM84zbfKcUxcyw5nEWZURgmTNsTwYu9W07muIYI6klIChbKEF5R4BEpsGyunGJDfwpaTPjzA8LGAhvh6GkXfg2P_8BNgErHgPSZwLxbrVe9vmkV-fzZFGaeh5f1UClg1dJ98XE_zVqJwCu8_9LP4aYNPjgGEjR5Y86kYkXqFJl5Vj3lrE4lpBQs_q2oCvEjVskvEN6FQbFqA8QzTCEK33NmvuO8ienjlXcKDBN4ZhyPCZ9xlbsQaEoxuIz3RCs',
    comments: 1,
  },
  {
    id: '9',
    title: 'Design marketing assets',
    status: 'completed',
    category: 'Marketing',
    dueDate: 'Jan 08, 2027',
    assigneeAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAs2m5c5ty_OkJsxLYDv2i73k40IyhgA4UrhibSctj53GYkmPmVAc16NqkEZjEmMqevYzG5h-AkuCcvNY69DBmcAqSZV3pGEXSRnOXN6a_AQmw4-ykpmIZux9fw_T0tr2DsdC2qhg_qeFXjEhGdHOL68LRaSKNjQAGUmqi5ksaBy_n0PV50HHHSKNmm7MoKiqdim7zJKSQwYm_tK89-0r1KpEUy_soIR1iTsGea1W0KPXI898CEaym12vwPryVjg57UyGi1SXvKbfA',
    comments: 1,
    attachments: 2,
  },
];

const columns: KanbanColumnType[] = [
  {
    id: 'todo',
    title: 'To Do',
    tasks: mockTasks.filter((t) => t.status === 'todo'),
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tasks: mockTasks.filter((t) => t.status === 'in-progress'),
  },
  {
    id: 'completed',
    title: 'Completed',
    tasks: mockTasks.filter((t) => t.status === 'completed'),
  },
];

type FilterType = 'all' | 'todo' | 'in-progress' | 'completed';

export function KanbanBoard() {
  const [activeFilter, setActiveFilter] = React.useState<FilterType>('all');

  const filteredColumns =
    activeFilter === 'all'
      ? columns
      : columns.filter((c) => c.id === activeFilter);

  const getCounts = () => {
    const todo = mockTasks.filter((t) => t.status === 'todo').length;
    const inProgress = mockTasks.filter((t) => t.status === 'in-progress').length;
    const completed = mockTasks.filter((t) => t.status === 'completed').length;
    return { all: mockTasks.length, todo, inProgress, completed };
  };

  const counts = getCounts();

  return (
    <section className="flex-1 overflow-y-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Kanban Task Management Board
        </h1>
        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
          <a className="hover:text-[#3c50e0]" href="#">
            Home
          </a>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-slate-900 dark:text-white font-medium">Kanban</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
          {[
            { key: 'all', label: 'All Tasks', count: counts.all },
            { key: 'todo', label: 'To do', count: counts.todo },
            { key: 'in-progress', label: 'In Progress', count: counts.inProgress },
            { key: 'completed', label: 'Completed', count: counts.completed },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key as FilterType)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1.5 ${
                activeFilter === filter.key
                  ? 'bg-white dark:bg-slate-600 text-slate-700 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              {filter.label}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  filter.key === 'completed'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold'
                    : 'bg-slate-200 dark:bg-slate-500 text-slate-600 dark:text-slate-200'
                }`}
              >
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              className="pl-4 pr-10 py-2 text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg w-64 focus:ring-1 focus:ring-[#3c50e0] outline-none"
              placeholder="Search"
              type="text"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#3c50e0] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md">
            Add New Task
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredColumns.map((column) => (
          <KanbanColumn key={column.id} column={column} />
        ))}
      </div>
    </section>
  );
}

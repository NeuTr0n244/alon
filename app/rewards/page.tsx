'use client';

import { useState, useEffect } from 'react';
import { BackButton } from '@/components/BackButton';
import styles from './rewards.module.css';

interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  type: 'daily' | 'weekly' | 'achievement';
}

export default function RewardsPage() {
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [missions, setMissions] = useState<Mission[]>([]);

  useEffect(() => {
    // Carregar do localStorage
    const savedPoints = localStorage.getItem('rewardPoints');
    if (savedPoints) setPoints(parseInt(savedPoints));

    // Missões mock
    setMissions([
      { id: '1', title: 'First Trade', description: 'Make your first swap', points: 100, completed: true, type: 'achievement' },
      { id: '2', title: 'Daily Login', description: 'Visit the app today', points: 10, completed: true, type: 'daily' },
      { id: '3', title: 'Track a Token', description: 'Add a token to your watchlist', points: 25, completed: false, type: 'daily' },
      { id: '4', title: 'Read 5 News', description: 'Let Alon read 5 news articles', points: 50, completed: false, type: 'daily' },
      { id: '5', title: 'Connect Wallet', description: 'Connect your Solana wallet', points: 200, completed: false, type: 'achievement' },
      { id: '6', title: 'Weekly Explorer', description: 'Visit app 7 days in a row', points: 500, completed: false, type: 'weekly' },
      { id: '7', title: 'Social Butterfly', description: 'Share a post in Trenches', points: 75, completed: false, type: 'weekly' },
    ]);
  }, []);

  useEffect(() => {
    // Calcular nível
    const newLevel = Math.floor(points / 500) + 1;
    setLevel(newLevel);
    localStorage.setItem('rewardPoints', points.toString());
  }, [points]);

  const claimMission = (mission: Mission) => {
    if (mission.completed) return;

    setMissions(prev => prev.map(m =>
      m.id === mission.id ? { ...m, completed: true } : m
    ));
    setPoints(prev => prev + mission.points);
  };

  const dailyMissions = missions.filter(m => m.type === 'daily');
  const weeklyMissions = missions.filter(m => m.type === 'weekly');
  const achievements = missions.filter(m => m.type === 'achievement');

  const progressToNextLevel = (points % 500) / 500 * 100;

  return (
    <div className={styles.container}>
      <BackButton />

      <div className={styles.header}>
        <h1>🎁 Rewards</h1>
        <p>Complete missions to earn points</p>
      </div>

      {/* Stats Card */}
      <div className={styles.statsCard}>
        <div className={styles.levelBadge}>
          <span className={styles.levelNum}>{level}</span>
          <span className={styles.levelLabel}>LEVEL</span>
        </div>

        <div className={styles.pointsInfo}>
          <span className={styles.pointsValue}>{points.toLocaleString()}</span>
          <span className={styles.pointsLabel}>POINTS</span>
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressToNextLevel}%` }}
            />
          </div>
          <span className={styles.progressText}>
            {500 - (points % 500)} pts to Level {level + 1}
          </span>
        </div>
      </div>

      {/* Daily Missions */}
      <div className={styles.section}>
        <h2>📅 Daily Missions</h2>
        <div className={styles.missionList}>
          {dailyMissions.map(mission => (
            <div
              key={mission.id}
              className={`${styles.missionCard} ${mission.completed ? styles.completed : ''}`}
              onClick={() => claimMission(mission)}
            >
              <div className={styles.missionLeft}>
                <span className={styles.missionCheck}>
                  {mission.completed ? '✓' : '○'}
                </span>
                <div>
                  <span className={styles.missionTitle}>{mission.title}</span>
                  <span className={styles.missionDesc}>{mission.description}</span>
                </div>
              </div>
              <div className={styles.missionPoints}>
                +{mission.points} pts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Missions */}
      <div className={styles.section}>
        <h2>📆 Weekly Missions</h2>
        <div className={styles.missionList}>
          {weeklyMissions.map(mission => (
            <div
              key={mission.id}
              className={`${styles.missionCard} ${mission.completed ? styles.completed : ''}`}
              onClick={() => claimMission(mission)}
            >
              <div className={styles.missionLeft}>
                <span className={styles.missionCheck}>
                  {mission.completed ? '✓' : '○'}
                </span>
                <div>
                  <span className={styles.missionTitle}>{mission.title}</span>
                  <span className={styles.missionDesc}>{mission.description}</span>
                </div>
              </div>
              <div className={styles.missionPoints}>
                +{mission.points} pts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className={styles.section}>
        <h2>🏆 Achievements</h2>
        <div className={styles.missionList}>
          {achievements.map(mission => (
            <div
              key={mission.id}
              className={`${styles.missionCard} ${mission.completed ? styles.completed : ''}`}
            >
              <div className={styles.missionLeft}>
                <span className={styles.missionCheck}>
                  {mission.completed ? '🏆' : '🔒'}
                </span>
                <div>
                  <span className={styles.missionTitle}>{mission.title}</span>
                  <span className={styles.missionDesc}>{mission.description}</span>
                </div>
              </div>
              <div className={styles.missionPoints}>
                +{mission.points} pts
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

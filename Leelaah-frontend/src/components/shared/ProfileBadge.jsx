import React from 'react';
import BadgeArtifact from '../Badges/BadgeArtifact';
import './ProfileBadge.css';

// ────────────────────────────────────────────────────────────────────────────────
// ProfileBadge — Compact Nexus Artifact for profile display
// Uses the full BadgeArtifact component in compact mode.
// ────────────────────────────────────────────────────────────────────────────────

const ProfileBadge = ({ badge }) => {
  return (
    <BadgeArtifact
      badge={badge}
      earned={true}
      compact={true}
      size={52}
      showRewards={false}
      showTooltip={true}
    />
  );
};

export default ProfileBadge;

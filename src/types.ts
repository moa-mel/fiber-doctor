
export interface Channel {
  state: 'Open' | 'Pending' | 'Closed';
  local_balance: string;
  remote_balance: string;
  channel_id: string;
  peer_id: string;
  // Add other channel properties as needed
}
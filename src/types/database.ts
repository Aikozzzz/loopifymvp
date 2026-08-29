export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          township: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          township?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          township?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      items: {
        Row: {
          id: string;
          donor_id: string;
          title: string;
          description: string;
          category: Database['public']['Enums']['item_category'];
          condition: Database['public']['Enums']['item_condition'];
          status: Database['public']['Enums']['item_status'];
          township: string;
          image_path: string;
          food_expiration_date: string | null;
          pickup_deadline: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          donor_id: string;
          title: string;
          description: string;
          category: Database['public']['Enums']['item_category'];
          condition: Database['public']['Enums']['item_condition'];
          status?: Database['public']['Enums']['item_status'];
          township: string;
          image_path: string;
          food_expiration_date?: string | null;
          pickup_deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          donor_id?: string;
          title?: string;
          description?: string;
          category?: Database['public']['Enums']['item_category'];
          condition?: Database['public']['Enums']['item_condition'];
          status?: Database['public']['Enums']['item_status'];
          township?: string;
          image_path?: string;
          food_expiration_date?: string | null;
          pickup_deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'items_donor_id_fkey';
            columns: ['donor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      donation_requests: {
        Row: {
          id: string;
          item_id: string;
          requester_id: string;
          request_message: string;
          status: Database['public']['Enums']['request_status'];
          donor_reply: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          requester_id: string;
          request_message: string;
          status?: Database['public']['Enums']['request_status'];
          donor_reply?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          requester_id?: string;
          request_message?: string;
          status?: Database['public']['Enums']['request_status'];
          donor_reply?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'donation_requests_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'donation_requests_requester_id_fkey';
            columns: ['requester_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      events: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          description: string;
          event_type: Database['public']['Enums']['event_type'];
          location_name: string;
          township: string;
          starts_at: string;
          ends_at: string | null;
          status: Database['public']['Enums']['event_status'];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          title: string;
          description: string;
          event_type: Database['public']['Enums']['event_type'];
          location_name: string;
          township: string;
          starts_at: string;
          ends_at?: string | null;
          status?: Database['public']['Enums']['event_status'];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          title?: string;
          description?: string;
          event_type?: Database['public']['Enums']['event_type'];
          location_name?: string;
          township?: string;
          starts_at?: string;
          ends_at?: string | null;
          status?: Database['public']['Enums']['event_status'];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'events_creator_id_fkey';
            columns: ['creator_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      event_participants: {
        Row: {
          event_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          event_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          event_id?: string;
          user_id?: string;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_participants_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'event_participants_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: Database['public']['Enums']['report_target_type'];
          item_id: string | null;
          event_id: string | null;
          reported_user_id: string | null;
          reason: Database['public']['Enums']['report_reason'];
          details: string | null;
          status: Database['public']['Enums']['report_status'];
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          target_type: Database['public']['Enums']['report_target_type'];
          item_id?: string | null;
          event_id?: string | null;
          reported_user_id?: string | null;
          reason: Database['public']['Enums']['report_reason'];
          details?: string | null;
          status?: Database['public']['Enums']['report_status'];
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          target_type?: Database['public']['Enums']['report_target_type'];
          item_id?: string | null;
          event_id?: string | null;
          reported_user_id?: string | null;
          reason?: Database['public']['Enums']['report_reason'];
          details?: string | null;
          status?: Database['public']['Enums']['report_status'];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reports_reporter_id_fkey';
            columns: ['reporter_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_reported_user_id_fkey';
            columns: ['reported_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_donation_request: {
        Args: {
          p_request_id: string;
          p_donor_reply?: string | null;
        };
        Returns: undefined;
      };
      decline_donation_request: {
        Args: {
          p_request_id: string;
        };
        Returns: undefined;
      };
      cancel_donation_request: {
        Args: {
          p_request_id: string;
        };
        Returns: undefined;
      };
      complete_donation: {
        Args: {
          p_item_id: string;
        };
        Returns: undefined;
      };
      withdraw_item: {
        Args: {
          p_item_id: string;
        };
        Returns: undefined;
      };
      complete_event: {
        Args: {
          p_event_id: string;
        };
        Returns: undefined;
      };
      cancel_event: {
        Args: {
          p_event_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      item_category:
        | 'clothes'
        | 'books'
        | 'electronics'
        | 'furniture'
        | 'sealed_food'
        | 'household'
        | 'other';
      item_condition: 'new' | 'like_new' | 'good' | 'fair';
      item_status: 'available' | 'reserved' | 'completed' | 'withdrawn';
      request_status:
        | 'pending'
        | 'accepted'
        | 'declined'
        | 'cancelled'
        | 'fulfilled';
      event_type:
        | 'cleanup'
        | 'food_drive'
        | 'clothing_drive'
        | 'recycling'
        | 'other';
      event_status: 'upcoming' | 'completed' | 'cancelled';
      report_target_type: 'item' | 'event' | 'user';
      report_reason:
        | 'prohibited_item'
        | 'unsafe_behavior'
        | 'harassment'
        | 'spam'
        | 'other';
      report_status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type PublicTables = Database['public']['Tables'];
export type TableName = keyof PublicTables;
export type TableRow<T extends TableName> = PublicTables[T]['Row'];
export type TableInsert<T extends TableName> = PublicTables[T]['Insert'];
export type TableUpdate<T extends TableName> = PublicTables[T]['Update'];
export type PublicFunctions = Database['public']['Functions'];
export type FunctionName = keyof PublicFunctions;
export type FunctionArgs<T extends FunctionName> = PublicFunctions[T]['Args'];
export type FunctionResult<T extends FunctionName> = PublicFunctions[T]['Returns'];

export type ItemCategory = Database['public']['Enums']['item_category'];
export type ItemCondition = Database['public']['Enums']['item_condition'];
export type ItemStatus = Database['public']['Enums']['item_status'];
export type RequestStatus = Database['public']['Enums']['request_status'];
export type EventType = Database['public']['Enums']['event_type'];
export type EventStatus = Database['public']['Enums']['event_status'];
export type ReportTargetType = Database['public']['Enums']['report_target_type'];
export type ReportReason = Database['public']['Enums']['report_reason'];
export type ReportStatus = Database['public']['Enums']['report_status'];

export type Profile = TableRow<'profiles'>;
export type Item = TableRow<'items'>;
export type DonationRequest = TableRow<'donation_requests'>;
export type CommunityEvent = TableRow<'events'>;
export type EventParticipant = TableRow<'event_participants'>;
export type Report = TableRow<'reports'>;

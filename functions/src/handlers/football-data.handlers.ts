import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {footballDataClient} from "../utils/api-clients";
import {handleError} from "../utils/error-handler";
import {ApiResponse, Team, Player, Competition} from "../@types";

interface MatchesApiResponse {
  matches: Array<Record<string, unknown>>;
}

interface StandingsApiResponse {
  standings: Array<Record<string, unknown>>;
}

const db = admin.firestore();

interface TeamsApiResponse {
  competition: {
    id: number;
    name: string;
    code: string;
    emblem: string;
    area?: { name: string };
  };
  season: {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
  };
  teams: ApiTeam[];
}

interface ApiTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  address: string;
  website: string;
  founded: number;
  clubColors: string;
  venue: string;
  coach?: {
    id: number;
    firstName: string;
    lastName: string;
    name: string;
    dateOfBirth: string;
    nationality: string;
    contract?: { start: string; until: string };
  };
  squad?: ApiSquadPlayer[];
}

interface ApiSquadPlayer {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth: string;
  nationality: string;
  position: string;
  shirtNumber?: number;
}

export const fetchEplTeams = onRequest(async (_req, res) => {
  try {
    logger.info("Fetching EPL teams from football-data.org");

    const response = await footballDataClient.get<TeamsApiResponse>(
      "/competitions/PL/teams"
    );
    const {competition, season, teams}: TeamsApiResponse = response.data;

    const batch: FirebaseFirestore.WriteBatch = db.batch();

    const competitionDoc: Competition = {
      id: competition.id,
      name: competition.name,
      code: competition.code,
      emblem: competition.emblem,
      country: competition.area?.name || "England",
      currentSeason: {
        id: season.id,
        startDate: season.startDate,
        endDate: season.endDate,
        currentMatchday: season.currentMatchday,
      },
    };

    const competitionRef: FirebaseFirestore.DocumentReference = db
      .collection("competitions")
      .doc("PL");
    batch.set(
      competitionRef,
      {...competitionDoc, lastUpdated: admin.firestore.FieldValue.serverTimestamp()},
      {merge: true}
    );

    for (const apiTeam of teams) {
      const team: Omit<Team, "lastUpdated"> = {
        id: apiTeam.id,
        name: apiTeam.name,
        shortName: apiTeam.shortName,
        tla: apiTeam.tla,
        crest: apiTeam.crest,
        address: apiTeam.address,
        website: apiTeam.website,
        founded: apiTeam.founded,
        clubColors: apiTeam.clubColors,
        venue: apiTeam.venue,
        competitionCode: "PL",
        coach: apiTeam.coach
          ? {
            id: apiTeam.coach.id,
            firstName: apiTeam.coach.firstName,
            lastName: apiTeam.coach.lastName,
            name: apiTeam.coach.name,
            dateOfBirth: apiTeam.coach.dateOfBirth,
            nationality: apiTeam.coach.nationality,
            contract: apiTeam.coach.contract || null,
          }
          : null,
        squadCount: apiTeam.squad?.length || 0,
      };

      const teamRef: FirebaseFirestore.DocumentReference = db
        .collection("teams")
        .doc(String(apiTeam.id));
      batch.set(
        teamRef,
        {...team, lastUpdated: admin.firestore.FieldValue.serverTimestamp()},
        {merge: true}
      );
    }

    await batch.commit();

    logger.info(`Stored ${teams.length} EPL teams`);

    const apiResponse: ApiResponse<{teamsCount: number; season: string}> = {
      success: true,
      data: {
        teamsCount: teams.length,
        season: `${season.startDate} - ${season.endDate}`,
      },
      timestamp: new Date().toISOString(),
    };
    res.json(apiResponse);
  } catch (error: unknown) {
    handleError(error, res);
  }
});

export const fetchEplPlayers = onRequest(async (_req, res) => {
  try {
    logger.info("Fetching EPL teams + squads from football-data.org");

    const response = await footballDataClient.get<TeamsApiResponse>(
      "/competitions/PL/teams"
    );
    const {teams}: TeamsApiResponse = response.data;

    let totalPlayers: number = 0;
    const teamSummaries: Array<{team: string; players: number}> = [];

    for (const apiTeam of teams) {
      const squad: ApiSquadPlayer[] = apiTeam.squad || [];
      const batch: FirebaseFirestore.WriteBatch = db.batch();

      for (const p of squad) {
        const player: Omit<Player, "lastUpdated"> = {
          id: p.id,
          name: p.name,
          firstName: p.firstName || null,
          lastName: p.lastName || null,
          dateOfBirth: p.dateOfBirth,
          nationality: p.nationality,
          position: p.position,
          shirtNumber: p.shirtNumber || null,
          teamId: apiTeam.id,
          teamName: apiTeam.name,
          teamTla: apiTeam.tla,
          competitionCode: "PL",
        };

        const playerRef: FirebaseFirestore.DocumentReference = db
          .collection("players")
          .doc(String(p.id));
        batch.set(
          playerRef,
          {...player, lastUpdated: admin.firestore.FieldValue.serverTimestamp()},
          {merge: true}
        );
      }

      await batch.commit();
      totalPlayers += squad.length;
      teamSummaries.push({team: apiTeam.name, players: squad.length});
    }

    logger.info(`Stored ${totalPlayers} players across ${teams.length} teams`);

    const apiResponse: ApiResponse<{
      totalPlayers: number;
      teamsCount: number;
      teams: Array<{team: string; players: number}>;
    }> = {
      success: true,
      data: {totalPlayers, teamsCount: teams.length, teams: teamSummaries},
      timestamp: new Date().toISOString(),
    };
    res.json(apiResponse);
  } catch (error: unknown) {
    handleError(error, res);
  }
});

export const syncFixtures = onRequest(async (_req, res) => {
  try {
    logger.info("Syncing PL fixtures from football-data.org");

    const response = await footballDataClient.get<MatchesApiResponse>(
      "/competitions/PL/matches"
    );
    const matches = response.data.matches || [];

    // Write individual fixture docs in batches of 500
    const batchSize = 500;
    for (let i = 0; i < matches.length; i += batchSize) {
      const batch = db.batch();
      const chunk = matches.slice(i, i + batchSize);
      for (const match of chunk) {
        const matchId = (match as any).id;
        if (matchId) {
          const ref = db.collection("fixtures").doc(String(matchId));
          batch.set(ref, {
            ...match,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          }, {merge: true});
        }
      }
      await batch.commit();
    }

    // Write cache doc with all fixtures
    await db.collection("cache").doc("fixtures").set({
      fixtures: matches,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info(`Stored ${matches.length} PL fixtures`);

    const apiResponse: ApiResponse<{fixturesCount: number}> = {
      success: true,
      data: {fixturesCount: matches.length},
      timestamp: new Date().toISOString(),
    };
    res.json(apiResponse);
  } catch (error: unknown) {
    handleError(error, res);
  }
});

export const syncStandings = onRequest(async (_req, res) => {
  try {
    logger.info("Syncing PL standings from football-data.org");

    const response = await footballDataClient.get<StandingsApiResponse>(
      "/competitions/PL/standings"
    );
    const standings = response.data.standings || [];

    await db.collection("competitions").doc("PL")
      .collection("standings").doc("current").set({
        standings,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });

    await db.collection("cache").doc("standings_PL").set({
      standings,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info("Stored PL standings");

    const apiResponse: ApiResponse<{standingsGroups: number}> = {
      success: true,
      data: {standingsGroups: standings.length},
      timestamp: new Date().toISOString(),
    };
    res.json(apiResponse);
  } catch (error: unknown) {
    handleError(error, res);
  }
});

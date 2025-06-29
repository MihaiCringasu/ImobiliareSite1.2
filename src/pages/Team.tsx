import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import WhatsAppButton from "../components/WhatsAppButton";
import Footer from "../components/Footer";
import { teamService } from "@/services/api";
import type { TeamMember } from "@/types/api";

const TeamPage = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        console.log("Fetching team members...");

        const response = await teamService.getAll();
        console.log("API Response:", response);

        // Check if the request was successful
        if (!response.success) {
          console.error("Failed to fetch team members:", response.message);
          setError(
            response.message || "Eroare la preluarea datelor de la server",
          );
          return;
        }

        // Extract members from the response
        const members = response.data?.data || [];
        console.log("Team members from API:", members);

        if (members.length === 0) {
          console.warn(
            "No team members found in the database, using fallback data",
          );
          // Set fallback team members
          const fallbackMembers = [
            {
              id: "1",
              name: "Alexandru Georgescu",
              role: "Senior Account Manager",
              phone: "0748906304",
              email: "alexandru@casavis.ro",
              image: "https://randomuser.me/api/portraits/men/75.jpg",
            },
            {
              id: "2",
              name: "Maria Ionescu",
              role: "Agent imobiliar",
              phone: "0742801123",
              email: "maria@casavis.ro",
              image: "https://randomuser.me/api/portraits/women/75.jpg",
            },
          ];
          setTeamMembers(fallbackMembers);
          setError(null);
          return;
        }

        // Format members data
        const formattedMembers = members.map((member: TeamMember) => {
          // Extract first and last name from the name field if they don't exist
          const nameParts = member.name ? member.name.split(" ") : [];
          const firstName = member.firstName || nameParts[0] || "Nume";
          const lastName =
            member.lastName ||
            (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Agent");
          const name = member.name || `${firstName} ${lastName}`.trim();

          return {
            id: member.id || Math.random().toString(36).substr(2, 9),
            name,
            role: member.role || "Agent Imobiliar",
            phone: member.phone || "",
            email: member.email || "contact@dvs.ro",
            image: member.image || "/placeholder-avatar.jpg",
            firstName,
            lastName,
            createdAt: member.createdAt || new Date().toISOString(),
            updatedAt: member.updatedAt || new Date().toISOString(),
          };
        });

        console.log("Formatted team members:", formattedMembers);
        setTeamMembers(formattedMembers);
        setError(null);
      } catch (error) {
        console.error("Error in fetchTeamMembers:", error);
        // Set fallback team members when API fails
        const fallbackMembers = [
          {
            id: "1",
            name: "Alexandru Georgescu",
            role: "Senior Account Manager",
            phone: "0748906304",
            email: "alexandru@casavis.ro",
            image: "https://randomuser.me/api/portraits/men/75.jpg",
            firstName: "Alexandru",
            lastName: "Georgescu",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "2",
            name: "Maria Ionescu",
            role: "Agent imobiliar",
            phone: "0742801123",
            email: "maria@casavis.ro",
            image: "https://randomuser.me/api/portraits/women/75.jpg",
            firstName: "Maria",
            lastName: "Ionescu",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setTeamMembers(fallbackMembers);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="pt-20 sm:pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
              Echipa noastră
            </h1>
            <div className="w-24 h-1 bg-red-600 mx-auto"></div>
          </div>

          {/* Loading and Error States */}
          {loading && (
            <p className="text-center text-slate-600">Se încarcă...</p>
          )}
          {error && <p className="text-center text-red-600">{error}</p>}

          {/* Team Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {teamMembers.map((member) => (
                <div key={member.id} className="text-center group">
                  {/* Profile Image */}
                  <div className="relative mb-6">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  {/* Member Info */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-red-600 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-red-600 font-medium text-base">
                      {member.role}
                    </p>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-medium">{member.phone}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={`mailto:${member.email}`}
                          className="text-red-600 hover:text-red-700 hover:underline transition-colors"
                        >
                          {member.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom section removed as requested */}
        </div>
      </div>

      <WhatsAppButton />
      <Footer />
    </div>
  );
};

export default TeamPage;
